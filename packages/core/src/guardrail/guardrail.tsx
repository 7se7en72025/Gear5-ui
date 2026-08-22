import * as React from "react";
import type { PolicyRule } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";
import { visuallyHidden } from "../utils/visually-hidden";
import { safeStringify } from "../utils/format";

interface GuardrailContextValue {
  action: string;
  rule: PolicyRule;
  input: unknown;
  /** True when a human is allowed to let it through anyway. */
  overridable: boolean;
  override: () => void;
  detailsOpen: boolean;
  setDetailsOpen: (open: boolean) => void;
  actionId: string;
  detailsId: string;
}

const [GuardrailProvider, useGuardrailContext] =
  createContext<GuardrailContextValue>("Guardrail");

/** Read what was blocked and which rule blocked it. */
export function useGuardrail(): GuardrailContextValue {
  return useGuardrailContext("useGuardrail");
}

export interface GuardrailProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** What the agent tried to do. */
  action: string;
  /** The rule that stopped it. */
  rule: PolicyRule;
  /** The payload that was rejected. */
  input?: unknown;
  /**
   * Let a human push it through anyway. Omit for a hard block, and the
   * override control disappears rather than sitting there doing nothing.
   */
  onOverride?: () => void;
  detailsOpen?: boolean;
  defaultDetailsOpen?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
  asChild?: boolean;
}

/**
 * An action stopped by policy before it ran.
 *
 * Agents get blocked constantly and the usual treatment is a generic refusal,
 * which teaches the user nothing and makes the agent look broken rather than
 * careful. Naming the rule turns a dead end into something the user can act on.
 *
 * ```tsx
 * <Guardrail
 *   action="Write to /etc/hosts"
 *   rule={{ id: "fs-1", name: "no-writes-outside-workspace" }}
 *   onOverride={allowOnce}
 * >
 *   <GuardrailAction />
 *   <GuardrailRule />
 *   <GuardrailOverride />
 * </Guardrail>
 * ```
 */
export const Guardrail = React.forwardRef<HTMLDivElement, GuardrailProps>(
  function Guardrail(
    {
      action,
      rule,
      input,
      onOverride,
      detailsOpen: detailsOpenProp,
      defaultDetailsOpen = false,
      onDetailsOpenChange,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const actionId = `handoff-guardrail-${reactId}-action`;
    const detailsId = `handoff-guardrail-${reactId}-details`;

    const [detailsOpen = false, setDetailsOpen] = useControllableState({
      prop: detailsOpenProp,
      defaultProp: defaultDetailsOpen,
      onChange: onDetailsOpenChange,
    });

    const override = React.useCallback(() => onOverride?.(), [onOverride]);

    const Comp = resolveElement(asChild, "div");

    return (
      <GuardrailProvider
        value={{
          action,
          rule,
          input,
          overridable: Boolean(onOverride),
          override,
          detailsOpen,
          setDetailsOpen,
          actionId,
          detailsId,
        }}
      >
        <Comp
          ref={forwardedRef}
          // A blocked action is a status, not an emergency. The run is not
          // broken and nothing is waiting on the user, so this stays polite
          // where Approval and RunError interrupt.
          role="status"
          aria-labelledby={actionId}
          data-handoff-part="guardrail"
          data-rule={rule.name}
          {...rest}
        >
          {children}
          <span style={visuallyHidden}>
            {` Blocked by ${rule.name}.`}
            {rule.explanation ? ` ${rule.explanation}` : ""}
          </span>
        </Comp>
      </GuardrailProvider>
    );
  },
);

export interface GuardrailActionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** What the agent tried to do. Labels the whole block. */
export const GuardrailAction = React.forwardRef<
  HTMLDivElement,
  GuardrailActionProps
>(function GuardrailAction({ asChild = false, children, ...rest }, forwardedRef) {
  const { action, actionId } = useGuardrailContext("GuardrailAction");
  const Comp = resolveElement(asChild, "div");

  return (
    <Comp ref={forwardedRef} id={actionId} {...rest}>
      {children ?? action}
    </Comp>
  );
});

export interface GuardrailRuleProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * The rule that blocked it.
 *
 * Hidden from assistive tech because the root already reads the rule as part
 * of one sentence, and hearing the bare identifier twice helps nobody.
 */
export const GuardrailRule = React.forwardRef<HTMLSpanElement, GuardrailRuleProps>(
  function GuardrailRule({ asChild = false, children, ...rest }, forwardedRef) {
    const { rule } = useGuardrailContext("GuardrailRule");
    const Comp = resolveElement(asChild, "span");

    return (
      <Comp ref={forwardedRef} aria-hidden="true" data-handoff-slot="rule" {...rest}>
        {children ?? rule.name}
      </Comp>
    );
  },
);

export interface GuardrailExplanationProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

/** Why the rule exists. Absent when the rule carries no explanation. */
export const GuardrailExplanation = React.forwardRef<
  HTMLParagraphElement,
  GuardrailExplanationProps
>(function GuardrailExplanation({ asChild = false, children, ...rest }, forwardedRef) {
  const { rule } = useGuardrailContext("GuardrailExplanation");
  if (!rule.explanation && children === undefined) return null;

  const Comp = resolveElement(asChild, "p");
  return (
    <Comp ref={forwardedRef} aria-hidden="true" {...rest}>
      {children ?? rule.explanation}
    </Comp>
  );
});

export interface GuardrailPayloadProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  asChild?: boolean;
}

/** The rejected payload, behind a disclosure so it is not read on entry. */
export const GuardrailPayload = React.forwardRef<
  HTMLDivElement,
  GuardrailPayloadProps
>(function GuardrailPayload({ label, asChild = false, ...rest }, forwardedRef) {
  const { input, detailsOpen, setDetailsOpen, detailsId } =
    useGuardrailContext("GuardrailPayload");

  const text = safeStringify(input);
  if (!text) return null;

  const Comp = resolveElement(asChild, "div");

  return (
    <Comp ref={forwardedRef} data-handoff-slot="guardrail-payload" {...rest}>
      <button
        type="button"
        aria-expanded={detailsOpen}
        aria-controls={detailsId}
        onClick={() => setDetailsOpen(!detailsOpen)}
        data-state={detailsOpen ? "open" : "closed"}
      >
        {label ?? (detailsOpen ? "Hide what was blocked" : "Show what was blocked")}
      </button>

      {detailsOpen ? <pre id={detailsId}>{text}</pre> : null}
    </Comp>
  );
});

export interface GuardrailOverrideProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Let it through anyway. Absent entirely on a hard block. */
export const GuardrailOverride = React.forwardRef<
  HTMLButtonElement,
  GuardrailOverrideProps
>(function GuardrailOverride(
  { asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { override, overridable, actionId } =
    useGuardrailContext("GuardrailOverride");
  const selfId = React.useId();

  if (!overridable) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      id={selfId}
      type="button"
      // Named against the action, so a run with several blocks does not read
      // as a column of identical override buttons.
      aria-labelledby={`${selfId} ${actionId}`}
      data-handoff-slot="override"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        override();
      }}
      {...rest}
    >
      {children ?? "Allow anyway"}
    </Comp>
  );
});
