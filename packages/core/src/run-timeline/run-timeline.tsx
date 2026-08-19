import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

/** Where a step sits in the run. */
export type RunStepStatus = "pending" | "active" | "done" | "failed" | "skipped";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface RunStepContextValue {
  status: RunStepStatus;
}

const [RunStepProvider, useRunStepContext] =
  createContext<RunStepContextValue>("RunStep");

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface RunTimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  /**
   * Accessible name for the list. Without one, screen reader users hear an
   * unlabelled list of items with no indication it is the agent's trace.
   */
  label?: string;
  asChild?: boolean;
}

/**
 * An ordered trace of what the agent did.
 *
 * Renders a real `<ol>`: the steps happened in sequence, and assistive tech
 * should say so ("list, 5 items") rather than presenting a wall of divs.
 *
 * ```tsx
 * <RunTimeline label="Agent run">
 *   <RunStep status="done">
 *     <RunStepMarker />
 *     <RunStepContent>Read src/index.ts</RunStepContent>
 *   </RunStep>
 * </RunTimeline>
 * ```
 */
export const RunTimeline = React.forwardRef<HTMLOListElement, RunTimelineProps>(
  function RunTimeline(
    { label = "Agent run", asChild = false, ...rest },
    forwardedRef,
  ) {
    const Comp = resolveElement(asChild, "ol");
    return (
      <Comp
        ref={forwardedRef}
        aria-label={label}
        data-handoff-part="run-timeline"
        {...rest}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Step
 * ---------------------------------------------------------------------- */

export interface RunStepProps extends React.LiHTMLAttributes<HTMLLIElement> {
  status?: RunStepStatus;
  asChild?: boolean;
}

/** One step in the trace. */
export const RunStep = React.forwardRef<HTMLLIElement, RunStepProps>(
  function RunStep({ status = "pending", asChild = false, children, ...rest }, forwardedRef) {
    const Comp = resolveElement(asChild, "li");
    return (
      <RunStepProvider value={{ status }}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="run-step"
          data-status={status}
          aria-current={status === "active" ? "step" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </RunStepProvider>
    );
  },
);

const STEP_STATUS_LABEL: Record<RunStepStatus, string> = {
  pending: "Pending",
  active: "In progress",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

export interface RunStepMarkerProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  labels?: Partial<Record<RunStepStatus, string>>;
  asChild?: boolean;
}

/**
 * The dot or connector on the timeline rail.
 *
 * Purely visual, so the shape itself is hidden and the status is exposed as
 * text instead — a coloured circle means nothing to a screen reader.
 */
export const RunStepMarker = React.forwardRef<HTMLSpanElement, RunStepMarkerProps>(
  function RunStepMarker({ labels, asChild = false, children, ...rest }, forwardedRef) {
    const { status } = useRunStepContext("RunStepMarker");
    const Comp = resolveElement(asChild, "span");

    return (
      <Comp ref={forwardedRef} data-status={status} data-handoff-slot="marker" {...rest}>
        <span aria-hidden="true">{children}</span>
        <span style={visuallyHidden}>
          {labels?.[status] ?? STEP_STATUS_LABEL[status]}
        </span>
      </Comp>
    );
  },
);

export interface RunStepContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** The step body — free-form, typically a ToolCall or Reasoning block. */
export const RunStepContent = React.forwardRef<HTMLDivElement, RunStepContentProps>(
  function RunStepContent({ asChild = false, ...rest }, forwardedRef) {
    const Comp = resolveElement(asChild, "div");
    return <Comp ref={forwardedRef} data-handoff-slot="step-content" {...rest} />;
  },
);
