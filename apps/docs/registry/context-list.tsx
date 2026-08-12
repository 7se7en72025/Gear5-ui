"use client";

import * as React from "react";
import {
  ContextEntries,
  ContextEntry,
  ContextEntryName,
  ContextEntryRemove,
  ContextEntryTokens,
  ContextList as ContextListPrimitive,
  ContextSummary,
} from "handoff-ui";
import type { ContextItem } from "handoff-ui";
import { cn } from "./lib/utils";

export interface StyledContextListProps {
  items: readonly ContextItem[];
  budget?: number;
  onRemove?: (item: ContextItem) => void;
  className?: string;
}

/** Styled view of what the agent can see. */
export function ContextList({
  items,
  budget,
  onRemove,
  className,
}: StyledContextListProps) {
  return (
    <ContextListPrimitive
      items={items}
      budget={budget}
      onRemove={onRemove}
      className={cn("overflow-hidden rounded-panel border border-line bg-panel", className)}
    >
      <div className="border-b border-line px-3 py-2">
        <ContextSummary
          className={cn(
            "relative flex items-center gap-2 font-mono text-[12px] text-fg-muted",
            "data-[over-budget]:text-warning",
          )}
        />
        {budget ? (
          <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-bg">
            {/* The primitive publishes the fill, so nothing is recomputed here. */}
            <span
              aria-hidden="true"
              className="block h-full bg-accent transition-[width] duration-300"
              style={{ width: "calc(var(--handoff-context-fill, 0) * 100%)" }}
            />
          </div>
        ) : null}
      </div>

      <ContextEntries className="divide-y divide-line">
        {items.map((item) => (
          <ContextEntry
            key={item.id}
            item={item}
            className="flex items-center gap-3 px-3 py-2"
          >
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-fg-faint"
            >
              {item.kind ?? "item"}
            </span>

            <ContextEntryName
              className={cn(
                "min-w-0 flex-1 truncate font-mono text-[12px] text-fg",
                "data-[pinned]:text-accent",
              )}
            />

            <ContextEntryTokens className="shrink-0 font-mono text-[11px] text-fg-faint" />

            <ContextEntryRemove className="shrink-0 rounded px-1 text-[12px] text-fg-faint transition-colors hover:text-danger">
              <span aria-hidden="true">x</span>
            </ContextEntryRemove>
          </ContextEntry>
        ))}
      </ContextEntries>
    </ContextListPrimitive>
  );
}
