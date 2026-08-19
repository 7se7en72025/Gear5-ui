import * as React from "react";
import type { ContextItem } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";
import { formatTokens } from "../utils/format";

interface ContextListContextValue {
  items: readonly ContextItem[];
  totalTokens: number;
  budget: number | undefined;
  /** Fraction of the budget used, or null when no budget was given. */
  fill: number | null;
  overBudget: boolean;
  onRemove: ((item: ContextItem) => void) | undefined;
  labelId: string;
}

const [ContextListProvider, useContextListContext] =
  createContext<ContextListContextValue>("ContextList");

interface ContextEntryContextValue {
  item: ContextItem;
  labelId: string;
}

const [ContextEntryProvider, useContextEntryContext] =
  createContext<ContextEntryContextValue>("ContextEntry");

/** Read the totals for the whole list. */
export function useContextList(): ContextListContextValue {
  return useContextListContext("useContextList");
}

export interface ContextListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: readonly ContextItem[];
  /** Token budget, used for the fill and the over budget warning. */
  budget?: number;
  onRemove?: (item: ContextItem) => void;
  label?: string;
  asChild?: boolean;
}

/**
 * What the agent can currently see.
 *
 * "Why did it not know about that file" is one of the most common questions
 * people have about an agent, and the answer is almost always that the file was
 * never in context. This makes that visible, and shows what each item costs.
 *
 * ```tsx
 * <ContextList items={items} budget={200_000} onRemove={drop}>
 *   <ContextSummary />
 *   <ContextEntries>
 *     {items.map((item) => (
 *       <ContextEntry key={item.id} item={item}>
 *         <ContextEntryName />
 *         <ContextEntryTokens />
 *         <ContextEntryRemove />
 *       </ContextEntry>
 *     ))}
 *   </ContextEntries>
 * </ContextList>
 * ```
 */
export const ContextList = React.forwardRef<HTMLDivElement, ContextListProps>(
  function ContextList(
    { items, budget, onRemove, label = "Context", asChild = false, children, ...rest },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const labelId = `handoff-context-${reactId}-label`;

    const totalTokens = React.useMemo(
      () => items.reduce((sum, item) => sum + (item.tokens ?? 0), 0),
      [items],
    );

    const fill = budget && budget > 0 ? totalTokens / budget : null;
    const overBudget = fill !== null && fill > 1;

    const Comp = resolveElement(asChild, "div");

    return (
      <ContextListProvider
        value={{ items, totalTokens, budget, fill, overBudget, onRemove, labelId }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="context-list"
          data-over-budget={overBudget ? "" : undefined}
          {...rest}
        >
          <span id={labelId} style={visuallyHidden}>
            {label}
          </span>
          {children}
        </Comp>
      </ContextListProvider>
    );
  },
);

export interface ContextSummaryProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * Item count and total cost.
 *
 * Exposed as a progressbar when there is a budget, because running out of
 * context is the failure this component exists to warn about.
 */
export const ContextSummary = React.forwardRef<
  HTMLDivElement,
  ContextSummaryProps
>(function ContextSummary({ asChild = false, children, ...rest }, forwardedRef) {
  const { items, totalTokens, budget, fill, overBudget } =
    useContextListContext("ContextSummary");

  const Comp = resolveElement(asChild, "div");
  const count = items.length;
  const percent = fill === null ? null : Math.round(Math.min(1, fill) * 100);

  const progressProps =
    percent === null
      ? {}
      : {
          role: "progressbar" as const,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-valuenow": percent,
          "aria-valuetext": `${percent}% of the context budget used, ${totalTokens} of ${budget} tokens`,
        };

  return (
    <Comp
      ref={forwardedRef}
      data-handoff-slot="context-summary"
      data-over-budget={overBudget ? "" : undefined}
      style={
        fill === null
          ? undefined
          : ({ "--handoff-context-fill": String(Math.min(1, fill)) } as React.CSSProperties)
      }
      {...progressProps}
      {...rest}
    >
      {children ?? (
        <>
          <span aria-hidden="true">
            {count} {count === 1 ? "item" : "items"}, {formatTokens(totalTokens)}
          </span>
          <span style={visuallyHidden}>
            {`${count} ${count === 1 ? "item" : "items"} in context, ${totalTokens} tokens.`}
            {overBudget ? " Over budget, the oldest items will be dropped." : ""}
          </span>
        </>
      )}
    </Comp>
  );
});

export interface ContextEntriesProps
  extends React.HTMLAttributes<HTMLUListElement> {
  asChild?: boolean;
}

export const ContextEntries = React.forwardRef<
  HTMLUListElement,
  ContextEntriesProps
>(function ContextEntries({ asChild = false, ...rest }, forwardedRef) {
  const { labelId } = useContextListContext("ContextEntries");
  const Comp = resolveElement(asChild, "ul");
  return <Comp ref={forwardedRef} aria-labelledby={labelId} {...rest} />;
});

export interface ContextEntryProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  item: ContextItem;
  asChild?: boolean;
}

export const ContextEntry = React.forwardRef<HTMLLIElement, ContextEntryProps>(
  function ContextEntry({ item, asChild = false, children, ...rest }, forwardedRef) {
    const reactId = React.useId();
    const labelId = `handoff-ctx-item-${reactId}`;
    const Comp = resolveElement(asChild, "li");

    return (
      <ContextEntryProvider value={{ item, labelId }}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="context-entry"
          data-kind={item.kind}
          data-pinned={item.pinned ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </ContextEntryProvider>
    );
  },
);

export interface ContextEntryNameProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

export const ContextEntryName = React.forwardRef<
  HTMLSpanElement,
  ContextEntryNameProps
>(function ContextEntryName({ asChild = false, children, ...rest }, forwardedRef) {
  const { item, labelId } = useContextEntryContext("ContextEntryName");
  const Comp = resolveElement(asChild, "span");

  return (
    <Comp ref={forwardedRef} id={labelId} title={item.name} {...rest}>
      {children ?? item.name}
      {item.pinned ? <span style={visuallyHidden}> (pinned)</span> : null}
    </Comp>
  );
});

export interface ContextEntryTokensProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** What this one item costs. Absent when the backend did not measure it. */
export const ContextEntryTokens = React.forwardRef<
  HTMLSpanElement,
  ContextEntryTokensProps
>(function ContextEntryTokens({ asChild = false, children, ...rest }, forwardedRef) {
  const { item } = useContextEntryContext("ContextEntryTokens");
  if (item.tokens === undefined && children === undefined) return null;

  const Comp = resolveElement(asChild, "span");

  return (
    <Comp ref={forwardedRef} data-handoff-slot="entry-tokens" {...rest}>
      {children ?? (
        <>
          <span aria-hidden="true">{formatTokens(item.tokens ?? 0)}</span>
          <span style={visuallyHidden}>{` ${item.tokens} tokens`}</span>
        </>
      )}
    </Comp>
  );
});

export interface ContextEntryRemoveProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Drop the item from context. Named against it, like every other list here. */
export const ContextEntryRemove = React.forwardRef<
  HTMLButtonElement,
  ContextEntryRemoveProps
>(function ContextEntryRemove(
  { asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { onRemove } = useContextListContext("ContextEntryRemove");
  const { item, labelId } = useContextEntryContext("ContextEntryRemove");
  const selfId = React.useId();

  if (!onRemove) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      id={selfId}
      type="button"
      aria-labelledby={`${selfId} ${labelId}`}
      data-handoff-slot="entry-remove"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onRemove(item);
      }}
      {...rest}
    >
      {children ?? "Remove"}
    </Comp>
  );
});
