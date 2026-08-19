import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

interface AgentHandoffContextValue {
  from: string;
  to: string;
  reason: string | undefined;
}

const [AgentHandoffProvider, useAgentHandoffContext] =
  createContext<AgentHandoffContextValue>("AgentHandoff");

/** Read who handed off to whom. */
export function useAgentHandoff(): AgentHandoffContextValue {
  return useAgentHandoffContext("useAgentHandoff");
}

export interface AgentHandoffProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The agent giving up control. */
  from: string;
  /** The agent taking over. */
  to: string;
  /** Why control moved. Worth showing, since this is where runs go sideways. */
  reason?: string;
  /** Announce the transfer as it happens. */
  announce?: boolean;
  asChild?: boolean;
}

/**
 * Control passing from one agent to another.
 *
 * Multi agent runs fail in a specific way: the wrong agent picks up the work
 * and nobody notices until the output is wrong. Making each transfer visible,
 * with its reason, is how you catch that at the point it happens.
 *
 * ```tsx
 * <AgentHandoff from="researcher" to="writer" reason="Research complete">
 *   <AgentHandoffFrom />
 *   <AgentHandoffArrow />
 *   <AgentHandoffTo />
 *   <AgentHandoffReason />
 * </AgentHandoff>
 * ```
 */
export const AgentHandoff = React.forwardRef<HTMLDivElement, AgentHandoffProps>(
  function AgentHandoff(
    { from, to, reason, announce = true, asChild = false, children, ...rest },
    forwardedRef,
  ) {
    const Comp = resolveElement(asChild, "div");

    return (
      <AgentHandoffProvider value={{ from, to, reason }}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="agent-handoff"
          data-from={from}
          data-to={to}
          {...rest}
        >
          {children}
          {/* One sentence, so it does not have to be pieced together from
              three separate visual fragments. */}
          <span style={visuallyHidden}>
            {`${from} handed off to ${to}.${reason ? ` ${reason}.` : ""}`}
          </span>
        </Comp>
        {announce ? (
          <span role="status" aria-live="polite" style={visuallyHidden}>
            {`${to} is taking over from ${from}.`}
          </span>
        ) : null}
      </AgentHandoffProvider>
    );
  },
);

export interface AgentHandoffPartProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * The three visible fragments are hidden from assistive tech, because the root
 * already renders the whole thing as one readable sentence.
 */
function hiddenSpan(name: string, pick: (ctx: AgentHandoffContextValue) => React.ReactNode) {
  const Component = React.forwardRef<HTMLSpanElement, AgentHandoffPartProps>(
    function Part({ asChild = false, children, ...rest }, forwardedRef) {
      const ctx = useAgentHandoffContext(name);
      const value = pick(ctx);
      if (children === undefined && (value === undefined || value === null)) {
        return null;
      }

      const Comp = resolveElement(asChild, "span");
      return (
        <Comp ref={forwardedRef} aria-hidden="true" {...rest}>
          {children ?? value}
        </Comp>
      );
    },
  );
  Component.displayName = name;
  return Component;
}

export const AgentHandoffFrom = hiddenSpan("AgentHandoffFrom", (ctx) => ctx.from);
export const AgentHandoffTo = hiddenSpan("AgentHandoffTo", (ctx) => ctx.to);
export const AgentHandoffReason = hiddenSpan(
  "AgentHandoffReason",
  (ctx) => ctx.reason,
);

export interface AgentHandoffArrowProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The connector between the two names. Decorative. */
export const AgentHandoffArrow = React.forwardRef<
  HTMLSpanElement,
  AgentHandoffArrowProps
>(function AgentHandoffArrow({ asChild = false, children, ...rest }, forwardedRef) {
  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} aria-hidden="true" data-handoff-slot="arrow" {...rest}>
      {children ?? "->"}
    </Comp>
  );
});
