import * as React from "react";
import type { UsageStats } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";
import { formatCost, formatTokens } from "../utils/format";

interface UsageMeterContextValue {
  usage: UsageStats;
  totalTokens: number;
  /** Fraction of the context window consumed, 0–1, or null if unknown. */
  fill: number | null;
}

const [UsageMeterProvider, useUsageMeterContext] =
  createContext<UsageMeterContextValue>("UsageMeter");

/** Read the computed usage figures. */
export function useUsageMeter(): UsageMeterContextValue {
  return useUsageMeterContext("useUsageMeter");
}

export interface UsageMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  usage: UsageStats;
  asChild?: boolean;
}

/**
 * Token, cost, and context-window accounting for a run.
 *
 * ```tsx
 * <UsageMeter usage={{ inputTokens: 12400, outputTokens: 830, contextWindow: 200000 }}>
 *   <UsageMeterTokens />
 *   <UsageMeterContext />
 *   <UsageMeterCost />
 * </UsageMeter>
 * ```
 */
export const UsageMeter = React.forwardRef<HTMLDivElement, UsageMeterProps>(
  function UsageMeter({ usage, asChild = false, ...rest }, forwardedRef) {
    const totalTokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);

    // Both directions count: in a multi-turn run the model's own output is fed
    // back as context on the next turn.
    const fill =
      usage.contextWindow && usage.contextWindow > 0
        ? Math.min(1, totalTokens / usage.contextWindow)
        : null;

    const Comp = resolveElement(asChild, "div");

    return (
      <UsageMeterProvider value={{ usage, totalTokens, fill }}>
        <Comp ref={forwardedRef} data-handoff-part="usage-meter" {...rest} />
      </UsageMeterProvider>
    );
  },
);

export interface UsageMeterTokensProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** Input and output token counts. */
export const UsageMeterTokens = React.forwardRef<
  HTMLSpanElement,
  UsageMeterTokensProps
>(function UsageMeterTokens({ asChild = false, children, ...rest }, forwardedRef) {
  const { usage } = useUsageMeterContext("UsageMeterTokens");
  const Comp = resolveElement(asChild, "span");

  if (children !== undefined) {
    return (
      <Comp ref={forwardedRef} {...rest}>
        {children}
      </Comp>
    );
  }

  const input = usage.inputTokens ?? 0;
  const output = usage.outputTokens ?? 0;

  return (
    <Comp ref={forwardedRef} data-handoff-slot="tokens" {...rest}>
      <span aria-hidden="true">
        ↑{formatTokens(input)} ↓{formatTokens(output)}
      </span>
      <span style={visuallyHidden}>
        {input} tokens in, {output} tokens out
        {usage.cachedInputTokens ? `, ${usage.cachedInputTokens} cached` : ""}
      </span>
    </Comp>
  );
});

export interface UsageMeterCostProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** Run cost. Renders nothing when the backend did not report one. */
export const UsageMeterCost = React.forwardRef<
  HTMLSpanElement,
  UsageMeterCostProps
>(function UsageMeterCost({ asChild = false, children, ...rest }, forwardedRef) {
  const { usage } = useUsageMeterContext("UsageMeterCost");
  if (usage.costMicros === undefined && children === undefined) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} data-handoff-slot="cost" {...rest}>
      {children ?? formatCost(usage.costMicros ?? 0, usage.currency ?? "USD")}
    </Comp>
  );
});

export interface UsageMeterContextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Fraction above which the bar is flagged as nearly full. */
  warnAt?: number;
  asChild?: boolean;
}

/**
 * How much of the context window is consumed.
 *
 * Exposed as a progress bar rather than a decorative strip, because "how close
 * am I to losing earlier turns" is real information.
 */
export const UsageMeterContext = React.forwardRef<
  HTMLDivElement,
  UsageMeterContextProps
>(function UsageMeterContext(
  { warnAt = 0.8, asChild = false, children, ...rest },
  forwardedRef,
) {
  const { fill, totalTokens, usage } = useUsageMeterContext("UsageMeterContext");
  if (fill === null) return null;

  const percent = Math.round(fill * 100);
  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={forwardedRef}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}% of context used, ${totalTokens} of ${usage.contextWindow} tokens`}
      data-handoff-slot="context"
      data-warn={fill >= warnAt ? "" : undefined}
      style={
        // A CSS custom property, so consumers style the fill however they like
        // without this package shipping any styles of its own.
        { "--handoff-usage-fill": String(fill) } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </Comp>
  );
});
