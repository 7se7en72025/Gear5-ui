import * as React from "react";
import type { AgentRunStatus } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

interface AgentStatusContextValue {
  status: AgentRunStatus;
  label: string;
}

const [AgentStatusProvider, useAgentStatusContext] =
  createContext<AgentStatusContextValue>("AgentStatus");

const STATUS_LABEL: Record<AgentRunStatus, string> = {
  idle: "Idle",
  thinking: "Thinking",
  running: "Running a tool",
  waiting: "Waiting for you",
  error: "Something went wrong",
  done: "Done",
};

export interface AgentStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  status: AgentRunStatus;
  /** Override the wording, e.g. to name the running tool. */
  label?: string;
  labels?: Partial<Record<AgentRunStatus, string>>;
  asChild?: boolean;
}

/**
 * What the agent is doing right now.
 *
 * `waiting` is announced assertively because the run is blocked on the user;
 * everything else is polite so a long run does not talk over them.
 *
 * ```tsx
 * <AgentStatus status="running" label="Running read_file">
 *   <AgentStatusIndicator />
 *   <AgentStatusLabel />
 * </AgentStatus>
 * ```
 */
export const AgentStatus = React.forwardRef<HTMLDivElement, AgentStatusProps>(
  function AgentStatus(
    { status, label, labels, asChild = false, children, ...rest },
    forwardedRef,
  ) {
    const resolvedLabel = label ?? labels?.[status] ?? STATUS_LABEL[status];
    const Comp = resolveElement(asChild, "div");

    return (
      <AgentStatusProvider value={{ status, label: resolvedLabel }}>
        <Comp
          ref={forwardedRef}
          role="status"
          aria-live={status === "waiting" || status === "error" ? "assertive" : "polite"}
          data-handoff-part="agent-status"
          data-status={status}
          {...rest}
        >
          {children ?? <span style={visuallyHidden}>{resolvedLabel}</span>}
        </Comp>
      </AgentStatusProvider>
    );
  },
);

export interface AgentStatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The dot or spinner. Decorative — the label carries the meaning. */
export const AgentStatusIndicator = React.forwardRef<
  HTMLSpanElement,
  AgentStatusIndicatorProps
>(function AgentStatusIndicator({ asChild = false, ...rest }, forwardedRef) {
  const { status } = useAgentStatusContext("AgentStatusIndicator");
  const Comp = resolveElement(asChild, "span");
  return (
    <Comp
      ref={forwardedRef}
      aria-hidden="true"
      data-status={status}
      data-handoff-slot="indicator"
      {...rest}
    />
  );
});

export interface AgentStatusLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The status text. */
export const AgentStatusLabel = React.forwardRef<
  HTMLSpanElement,
  AgentStatusLabelProps
>(function AgentStatusLabel({ asChild = false, children, ...rest }, forwardedRef) {
  const { label } = useAgentStatusContext("AgentStatusLabel");
  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} {...rest}>
      {children ?? label}
    </Comp>
  );
});
