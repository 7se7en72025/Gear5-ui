"use client";

import * as React from "react";
import {
  UsageMeter as UsageMeterPrimitive,
  UsageMeterContext,
  UsageMeterCost,
  UsageMeterTokens,
} from "handoff-ui";
import type { UsageMeterProps as UsageMeterPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled token, cost, and context-window readout. */
export function UsageMeter({ className, ...props }: UsageMeterPrimitiveProps) {
  return (
    <UsageMeterPrimitive
      className={cn(
        "flex items-center gap-3 rounded-panel border border-line bg-panel px-3 py-2",
        className,
      )}
      {...props}
    >
      <UsageMeterTokens className="font-mono text-xs tabular-nums text-fg-muted" />

      <UsageMeterContext className="group relative h-1 flex-1 overflow-hidden rounded-full bg-panel-raised">
        {/* The primitive publishes the fill as --handoff-usage-fill so the bar
            can be drawn without this file recomputing anything. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-300",
            "group-data-[warn]:bg-warning",
          )}
          style={{ width: "calc(var(--handoff-usage-fill, 0) * 100%)" }}
        />
      </UsageMeterContext>

      <UsageMeterCost className="font-mono text-xs tabular-nums text-fg" />
    </UsageMeterPrimitive>
  );
}
