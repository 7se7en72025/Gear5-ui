import * as React from "react";
import type { ApprovalStatus, RiskLevel } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { formatDuration, safeStringify } from "../utils/format";
import { visuallyHidden } from "../utils/visually-hidden";

/** What the user chose. `always` approves and asks not to be prompted again. */
export type ApprovalDecision = "approve" | "deny" | "always";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface ApprovalContextValue {
  action: string;
  detail: string | undefined;
  input: unknown;
  risk: RiskLevel;
  status: ApprovalStatus;
  /** True once the user pressed approve on a gate that needs a second press. */
  confirming: boolean;
  requireConfirm: boolean;
  decide: (decision: ApprovalDecision) => void;
  cancelConfirm: () => void;
  /** Milliseconds until auto-deny, or null when the gate has no deadline. */
  remaining: number | null;
  resolved: boolean;
  actionId: string;
  detailId: string;
}

const [ApprovalProvider, useApprovalContext] =
  createContext<ApprovalContextValue>("Approval");

/** Read the enclosing approval's state — for custom sub-parts. */
export function useApproval(): ApprovalContextValue {
  return useApprovalContext("useApproval");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ApprovalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Short imperative summary, e.g. `Delete 12 files`. */
  action: string;
  /** Longer explanation of consequences. */
  detail?: string;
  /** The concrete payload being approved — a command, diff, or request body. */
  input?: unknown;
  /** Drives emphasis and, by default, whether a second press is required. */
  risk?: RiskLevel;
  status?: ApprovalStatus;
  onDecision?: (decision: ApprovalDecision) => void;
  /**
   * Require a second press before approving. Defaults to true for `high` risk.
   *
   * Agent approvals arrive mid-scroll and are easy to hit by reflex, so
   * destructive ones should not be one click away.
   */
  requireConfirm?: boolean;
  /** Epoch milliseconds after which the gate auto-denies. */
  expiresAt?: number;
  /** Fired once when the deadline passes. */
  onExpire?: () => void;
  /**
   * Move focus to the deny button when the gate appears.
   *
   * Off by default: stealing focus mid-stream is hostile unless the app is
   * genuinely blocked on the answer.
   */
  autoFocus?: boolean;
  asChild?: boolean;
}

const DEFAULT_STATUS: ApprovalStatus = "pending";

/**
 * A human-in-the-loop gate: the agent proposes an action and waits.
 *
 * ```tsx
 * <Approval
 *   action="Delete 12 files"
 *   risk="high"
 *   input={{ paths: ["src/old.ts"] }}
 *   onDecision={(decision) => respond(decision)}
 * >
 *   <ApprovalAction />
 *   <ApprovalRisk />
 *   <ApprovalPayload />
 *   <ApprovalActions>
 *     <ApprovalDeny />
 *     <ApprovalApprove />
 *   </ApprovalActions>
 * </Approval>
 * ```
 */
export const Approval = React.forwardRef<HTMLDivElement, ApprovalProps>(
  function Approval(
    {
      action,
      detail,
      input,
      risk = "medium",
      status = DEFAULT_STATUS,
      onDecision,
      requireConfirm,
      expiresAt,
      onExpire,
      autoFocus = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const actionId = `handoff-approval-${reactId}-action`;
    const detailId = `handoff-approval-${reactId}-detail`;

    const needsConfirm = requireConfirm ?? risk === "high";
    const resolved = status !== "pending";

    const [confirming, setConfirming] = React.useState(false);

    // A resolved gate must never keep a half-pressed confirm on screen.
    React.useEffect(() => {
      if (resolved) setConfirming(false);
    }, [resolved]);

    const decide = React.useCallback(
      (decision: ApprovalDecision) => {
        if (resolved) return;

        if (needsConfirm && decision !== "deny" && !confirming) {
          setConfirming(true);
          return;
        }
        setConfirming(false);
        onDecision?.(decision);
      },
      [resolved, needsConfirm, confirming, onDecision],
    );

    const cancelConfirm = React.useCallback(() => setConfirming(false), []);

    const remaining = useCountdown(expiresAt, !resolved);

    // Fire once. `onExpire` may be an inline arrow, so it is read from a ref
    // rather than listed as a dependency, which would re-arm the effect.
    const onExpireRef = React.useRef(onExpire);
    React.useEffect(() => {
      onExpireRef.current = onExpire;
    });
    const expiredRef = React.useRef(false);
    React.useEffect(() => {
      if (resolved || remaining === null || remaining > 0) return;
      if (expiredRef.current) return;
      expiredRef.current = true;
      onExpireRef.current?.();
    }, [remaining, resolved]);

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      if (!autoFocus || resolved) return;
      // Prefer the safe choice. Falling back to the container keeps focus in
      // the gate even when the consumer rendered no deny button.
      const safe = rootRef.current?.querySelector<HTMLElement>(
        '[data-handoff-slot="deny"]',
      );
      (safe ?? rootRef.current)?.focus();
    }, [autoFocus, resolved]);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const context: ApprovalContextValue = {
      action,
      detail,
      input,
      risk,
      status,
      confirming,
      requireConfirm: needsConfirm,
      decide,
      cancelConfirm,
      remaining,
      resolved,
      actionId,
      detailId,
    };

    const Comp = resolveElement(asChild, "div");

    return (
      <ApprovalProvider value={context}>
        <Comp
          ref={setRefs}
          // Not a dialog: the gate sits inline in the transcript and must not
          // trap focus or hide the run behind it.
          role="group"
          aria-labelledby={actionId}
          aria-describedby={detail ? detailId : undefined}
          tabIndex={autoFocus ? -1 : undefined}
          data-handoff-part="approval"
          data-status={status}
          data-risk={risk}
          data-confirming={confirming ? "" : undefined}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            // Escape backs out of a pending confirm rather than denying, so a
            // reflex keypress cannot resolve the gate.
            if (event.key === "Escape" && confirming) {
              event.stopPropagation();
              cancelConfirm();
            }
          }}
          {...rest}
        >
          {children}
        </Comp>
        <ApprovalAnnouncer />
      </ApprovalProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Countdown
 * ---------------------------------------------------------------------- */

/**
 * Milliseconds until `expiresAt`, or null when there is no deadline.
 * Returns null before mount so server and client markup agree.
 */
function useCountdown(expiresAt: number | undefined, active: boolean): number | null {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (expiresAt === undefined || !active) return;

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [expiresAt, active]);

  if (expiresAt === undefined || now === null) return null;
  return Math.max(0, expiresAt - now);
}

/* -------------------------------------------------------------------------
 * Announcer
 * ---------------------------------------------------------------------- */

/**
 * An approval blocks the run, so it is announced assertively — unlike tool
 * results, which are informational and use a polite region.
 */
function ApprovalAnnouncer() {
  const { action, status, risk, confirming } =
    useApprovalContext("ApprovalAnnouncer");
  const previous = React.useRef<ApprovalStatus | null>(null);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const prior = previous.current;
    previous.current = status;

    if (status === "pending" && prior === null) {
      setMessage(`Approval needed, ${risk} risk: ${action}.`);
      return;
    }
    if (prior === "pending" && status !== "pending") {
      setMessage(`${action} was ${status}.`);
    }
  }, [status, action, risk]);

  // A button label swapping from "Approve" to "Confirm" is not reliably
  // announced, so the armed state is stated outright.
  React.useEffect(() => {
    if (confirming) setMessage(`${action} needs confirmation. Press approve again.`);
  }, [confirming, action]);

  return (
    <div role="alert" aria-live="assertive" style={visuallyHidden}>
      {message}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Content parts
 * ---------------------------------------------------------------------- */

export interface ApprovalActionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** The imperative summary. Labels the whole group for screen readers. */
export const ApprovalAction = React.forwardRef<HTMLDivElement, ApprovalActionProps>(
  function ApprovalAction({ asChild = false, children, ...rest }, forwardedRef) {
    const { action, actionId } = useApprovalContext("ApprovalAction");
    const Comp = resolveElement(asChild, "div");
    return (
      <Comp ref={forwardedRef} id={actionId} {...rest}>
        {children ?? action}
      </Comp>
    );
  },
);

export interface ApprovalDetailProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** Consequences of approving. Wired as the group's description. */
export const ApprovalDetail = React.forwardRef<HTMLDivElement, ApprovalDetailProps>(
  function ApprovalDetail({ asChild = false, children, ...rest }, forwardedRef) {
    const { detail, detailId } = useApprovalContext("ApprovalDetail");
    if (!detail && children === undefined) return null;

    const Comp = resolveElement(asChild, "div");
    return (
      <Comp ref={forwardedRef} id={detailId} {...rest}>
        {children ?? detail}
      </Comp>
    );
  },
);

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export interface ApprovalRiskProps extends React.HTMLAttributes<HTMLSpanElement> {
  labels?: Partial<Record<RiskLevel, string>>;
  asChild?: boolean;
}

/** Risk badge. */
export const ApprovalRisk = React.forwardRef<HTMLSpanElement, ApprovalRiskProps>(
  function ApprovalRisk({ labels, asChild = false, children, ...rest }, forwardedRef) {
    const { risk } = useApprovalContext("ApprovalRisk");
    const Comp = resolveElement(asChild, "span");
    return (
      <Comp ref={forwardedRef} data-risk={risk} {...rest}>
        {children ?? labels?.[risk] ?? RISK_LABEL[risk]}
      </Comp>
    );
  },
);

export interface ApprovalPayloadProps
  extends React.HTMLAttributes<HTMLPreElement> {
  asChild?: boolean;
}

/** The exact payload under review, pretty-printed. */
export const ApprovalPayload = React.forwardRef<
  HTMLPreElement,
  ApprovalPayloadProps
>(function ApprovalPayload({ asChild = false, children, ...rest }, forwardedRef) {
  const { input } = useApprovalContext("ApprovalPayload");
  const text = safeStringify(input);
  if (!text && children === undefined) return null;

  const Comp = resolveElement(asChild, "pre");
  return (
    <Comp ref={forwardedRef} data-handoff-slot="payload" {...rest}>
      {children ?? text}
    </Comp>
  );
});

export interface ApprovalCountdownProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** Time left before the gate auto-denies. */
export const ApprovalCountdown = React.forwardRef<
  HTMLSpanElement,
  ApprovalCountdownProps
>(function ApprovalCountdown({ asChild = false, children, ...rest }, forwardedRef) {
  const { remaining, resolved } = useApprovalContext("ApprovalCountdown");
  if (remaining === null || resolved) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp
      ref={forwardedRef}
      // Ticks every 250ms; announcing it would drown out everything else.
      aria-hidden="true"
      data-expired={remaining <= 0 ? "" : undefined}
      {...rest}
    >
      {children ?? formatDuration(remaining)}
    </Comp>
  );
});

/* -------------------------------------------------------------------------
 * Buttons
 * ---------------------------------------------------------------------- */

export interface ApprovalActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** Layout container for the decision buttons. */
export const ApprovalActions = React.forwardRef<
  HTMLDivElement,
  ApprovalActionsProps
>(function ApprovalActions({ asChild = false, ...rest }, forwardedRef) {
  const Comp = resolveElement(asChild, "div");
  return <Comp ref={forwardedRef} data-handoff-slot="actions" {...rest} />;
});

interface DecisionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export interface ApprovalApproveProps extends DecisionButtonProps {
  /** Label shown once a confirm is pending. */
  confirmLabel?: React.ReactNode;
}

/**
 * Approve. On a gate that requires confirmation the first press arms it and the
 * second commits, with the label changing so the state is never ambiguous.
 */
export const ApprovalApprove = React.forwardRef<
  HTMLButtonElement,
  ApprovalApproveProps
>(function ApprovalApprove(
  { asChild = false, onClick, children, confirmLabel, ...rest },
  forwardedRef,
) {
  const { decide, resolved, confirming } = useApprovalContext("ApprovalApprove");

  const Comp = resolveElement(asChild, "button");
  const label = confirming ? (confirmLabel ?? "Confirm") : (children ?? "Approve");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      disabled={resolved}
      data-handoff-slot="approve"
      data-confirming={confirming ? "" : undefined}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        decide("approve");
      }}
      {...rest}
    >
      {label}
    </Comp>
  );
});

export type ApprovalDenyProps = DecisionButtonProps;

/** Deny. Never requires confirmation — the safe choice stays one press away. */
export const ApprovalDeny = React.forwardRef<HTMLButtonElement, ApprovalDenyProps>(
  function ApprovalDeny({ asChild = false, onClick, children, ...rest }, forwardedRef) {
    const { decide, resolved } = useApprovalContext("ApprovalDeny");
    const Comp = resolveElement(asChild, "button");

    return (
      <Comp
        ref={forwardedRef}
        type="button"
        disabled={resolved}
        data-handoff-slot="deny"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          decide("deny");
        }}
        {...rest}
      >
        {children ?? "Deny"}
      </Comp>
    );
  },
);

export type ApprovalAlwaysProps = DecisionButtonProps;

/** Approve and stop asking for this action. Follows the same confirm rules. */
export const ApprovalAlways = React.forwardRef<
  HTMLButtonElement,
  ApprovalAlwaysProps
>(function ApprovalAlways({ asChild = false, onClick, children, ...rest }, forwardedRef) {
  const { decide, resolved } = useApprovalContext("ApprovalAlways");
  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      disabled={resolved}
      data-handoff-slot="always"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        decide("always");
      }}
      {...rest}
    >
      {children ?? "Always allow"}
    </Comp>
  );
});

/* -------------------------------------------------------------------------
 * Outcome
 * ---------------------------------------------------------------------- */

export interface ApprovalOutcomeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  labels?: Partial<Record<Exclude<ApprovalStatus, "pending">, string>>;
  asChild?: boolean;
}

const OUTCOME_LABEL: Record<Exclude<ApprovalStatus, "pending">, string> = {
  approved: "Approved",
  denied: "Denied",
  expired: "Expired",
};

/** Replaces the buttons once a decision has been made. */
export const ApprovalOutcome = React.forwardRef<
  HTMLDivElement,
  ApprovalOutcomeProps
>(function ApprovalOutcome({ labels, asChild = false, children, ...rest }, forwardedRef) {
  const { status } = useApprovalContext("ApprovalOutcome");
  if (status === "pending") return null;

  const Comp = resolveElement(asChild, "div");
  return (
    <Comp ref={forwardedRef} data-status={status} data-handoff-slot="outcome" {...rest}>
      {children ?? labels?.[status] ?? OUTCOME_LABEL[status]}
    </Comp>
  );
});
