import * as React from "react";
import type { ToolCallStatus } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";
import { useElapsed } from "../utils/use-elapsed";
import { formatDuration, safeStringify } from "../utils/format";
import { visuallyHidden } from "../utils/visually-hidden";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface ToolCallContextValue {
  name: string;
  status: ToolCallStatus;
  input: unknown;
  output: unknown;
  error: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  elapsed: number | null;
  triggerId: string;
  panelId: string;
  disabled: boolean;
}

const [ToolCallProvider, useToolCallContext] =
  createContext<ToolCallContextValue>("ToolCall");

/** Read the enclosing tool call's state — for building your own sub-parts. */
export function useToolCall(): ToolCallContextValue {
  return useToolCallContext("useToolCall");
}

const TERMINAL: ReadonlySet<ToolCallStatus> = new Set<ToolCallStatus>([
  "success",
  "error",
  "cancelled",
]);

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ToolCallProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Tool identifier, e.g. `read_file`. */
  name: string;
  status: ToolCallStatus;
  /** May be partial or absent while `status` is `pending`. */
  input?: unknown;
  output?: unknown;
  /** Failure message, surfaced when `status` is `error`. */
  error?: string;
  startedAt?: number;
  endedAt?: number;
  /** Controlled disclosure state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Prevents expanding — useful for a compact read-only transcript. */
  disabled?: boolean;
  asChild?: boolean;
}

/**
 * A single tool invocation, rendered as an accessible disclosure.
 *
 * The root owns state and ARIA wiring only; every visible piece is a child part
 * you compose, so styling never fights the primitive.
 *
 * ```tsx
 * <ToolCall name="read_file" status="success" input={{ path: "a.ts" }} output="…">
 *   <ToolCallTrigger>
 *     <ToolCallName />
 *     <ToolCallStatusText />
 *     <ToolCallDuration />
 *   </ToolCallTrigger>
 *   <ToolCallPanel>
 *     <ToolCallInput />
 *     <ToolCallOutput />
 *   </ToolCallPanel>
 * </ToolCall>
 * ```
 */
export const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(
  function ToolCall(
    {
      name,
      status,
      input,
      output,
      error,
      startedAt,
      endedAt,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const triggerId = `handoff-tool-${reactId}-trigger`;
    const panelId = `handoff-tool-${reactId}-panel`;

    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    const isActive = status === "pending" || status === "running";
    const elapsed = useElapsed({ startedAt, endedAt, active: isActive });

    const context: ToolCallContextValue = {
      name,
      status,
      input,
      output,
      error,
      open,
      setOpen,
      elapsed,
      triggerId,
      panelId,
      disabled,
    };

    const Comp = resolveElement(asChild, "div");

    return (
      <ToolCallProvider value={context}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="tool-call"
          data-status={status}
          data-state={open ? "open" : "closed"}
          {...rest}
        >
          {children}
        </Comp>
        <ToolCallAnnouncer />
      </ToolCallProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Announcer
 * ---------------------------------------------------------------------- */

/**
 * Screen readers get no signal when a tool resolves, because the change happens
 * inside a collapsed panel. Announce terminal transitions only — announcing
 * every `pending → running` step would flood the user on a long run.
 */
function ToolCallAnnouncer() {
  const { name, status, elapsed, error } = useToolCallContext("ToolCallAnnouncer");
  const previousStatus = React.useRef(status);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const changed = previousStatus.current !== status;
    previousStatus.current = status;
    if (!changed || !TERMINAL.has(status)) return;

    const duration = elapsed !== null ? ` in ${formatDuration(elapsed)}` : "";
    if (status === "success") {
      setMessage(`Tool ${name} finished${duration}.`);
    } else if (status === "error") {
      setMessage(`Tool ${name} failed${duration}. ${error ?? ""}`.trim());
    } else {
      setMessage(`Tool ${name} was cancelled.`);
    }
  }, [status, name, elapsed, error]);

  return (
    <div role="status" aria-live="polite" style={visuallyHidden}>
      {message}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface ToolCallTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** The clickable header that expands the panel. Renders a real `<button>`. */
export const ToolCallTrigger = React.forwardRef<
  HTMLButtonElement,
  ToolCallTriggerProps
>(function ToolCallTrigger({ asChild = false, onClick, ...rest }, forwardedRef) {
  const { open, setOpen, triggerId, panelId, status, disabled } =
    useToolCallContext("ToolCallTrigger");

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      id={triggerId}
      // `type` matters: inside a form an untyped button submits it.
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      disabled={disabled}
      data-state={open ? "open" : "closed"}
      data-status={status}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        setOpen(!open);
      }}
      {...rest}
    />
  );
});

/* -------------------------------------------------------------------------
 * Panel
 * ---------------------------------------------------------------------- */

export interface ToolCallPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Keep the panel mounted while collapsed. Needed for exit animations and to
   * preserve scroll position in long outputs.
   */
  forceMount?: boolean;
  asChild?: boolean;
}

/** The expandable region holding input and output. */
export const ToolCallPanel = React.forwardRef<HTMLDivElement, ToolCallPanelProps>(
  function ToolCallPanel({ forceMount = false, asChild = false, ...rest }, forwardedRef) {
    const { open, panelId, triggerId } = useToolCallContext("ToolCallPanel");

    if (!open && !forceMount) return null;

    const Comp = resolveElement(asChild, "div");

    return (
      <Comp
        ref={forwardedRef}
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        data-state={open ? "open" : "closed"}
        hidden={!open}
        {...rest}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Leaf parts
 * ---------------------------------------------------------------------- */

export interface ToolCallNameProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The tool's identifier. */
export const ToolCallName = React.forwardRef<HTMLSpanElement, ToolCallNameProps>(
  function ToolCallName({ asChild = false, children, ...rest }, forwardedRef) {
    const { name } = useToolCallContext("ToolCallName");
    const Comp = resolveElement(asChild, "span");
    return (
      <Comp ref={forwardedRef} {...rest}>
        {children ?? name}
      </Comp>
    );
  },
);

const STATUS_LABEL: Record<ToolCallStatus, string> = {
  pending: "Preparing",
  running: "Running",
  success: "Completed",
  error: "Failed",
  cancelled: "Cancelled",
};

export interface ToolCallStatusTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Override the default wording, e.g. for localisation. */
  labels?: Partial<Record<ToolCallStatus, string>>;
  asChild?: boolean;
}

/** Human-readable status label. */
export const ToolCallStatusText = React.forwardRef<
  HTMLSpanElement,
  ToolCallStatusTextProps
>(function ToolCallStatusText({ labels, asChild = false, ...rest }, forwardedRef) {
  const { status } = useToolCallContext("ToolCallStatusText");
  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} data-status={status} {...rest}>
      {labels?.[status] ?? STATUS_LABEL[status]}
    </Comp>
  );
});

export interface ToolCallDurationProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * Elapsed time, ticking while the call is in flight.
 *
 * Renders nothing until a duration is known, so no layout shift on mount and no
 * hydration mismatch from a clock that differs between server and client.
 */
export const ToolCallDuration = React.forwardRef<
  HTMLSpanElement,
  ToolCallDurationProps
>(function ToolCallDuration({ asChild = false, ...rest }, forwardedRef) {
  const { elapsed } = useToolCallContext("ToolCallDuration");
  if (elapsed === null) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp
      ref={forwardedRef}
      // Duration updates constantly; announcing it would be noise.
      aria-hidden="true"
      {...rest}
    >
      {formatDuration(elapsed)}
    </Comp>
  );
});

export interface ToolCallInputProps extends React.HTMLAttributes<HTMLPreElement> {
  asChild?: boolean;
}

/** Arguments the model passed, pretty-printed and safe against partial JSON. */
export const ToolCallInput = React.forwardRef<HTMLPreElement, ToolCallInputProps>(
  function ToolCallInput({ asChild = false, children, ...rest }, forwardedRef) {
    const { input } = useToolCallContext("ToolCallInput");
    const text = safeStringify(input);

    // Absent while arguments stream in, and for tools that take none.
    if (!text) return null;

    const Comp = resolveElement(asChild, "pre");
    return (
      <Comp ref={forwardedRef} data-handoff-slot="input" {...rest}>
        {children ?? text}
      </Comp>
    );
  },
);

export interface ToolCallOutputProps extends React.HTMLAttributes<HTMLPreElement> {
  asChild?: boolean;
}

/** Tool result, or the error message when the call failed. */
export const ToolCallOutput = React.forwardRef<HTMLPreElement, ToolCallOutputProps>(
  function ToolCallOutput({ asChild = false, children, ...rest }, forwardedRef) {
    const { output, error, status } = useToolCallContext("ToolCallOutput");

    const text = status === "error" ? (error ?? "Tool failed.") : safeStringify(output);
    if (!text) return null;

    const Comp = resolveElement(asChild, "pre");
    return (
      <Comp
        ref={forwardedRef}
        data-handoff-slot="output"
        data-status={status}
        {...rest}
      >
        {children ?? text}
      </Comp>
    );
  },
);
