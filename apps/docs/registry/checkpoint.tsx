"use client";

import * as React from "react";
import {
  Checkpoint as CheckpointPrimitive,
  CheckpointDiscardCount,
  CheckpointLabel,
  CheckpointRestore,
} from "handoff-ui";
import type { CheckpointProps as CheckpointPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled rewind point. */
export function Checkpoint({ className, ...props }: CheckpointPrimitiveProps) {
  return (
    <CheckpointPrimitive
      className={cn(
        "flex items-center gap-3 rounded-panel border border-line bg-panel px-3 py-2.5",
        "data-[current]:border-line-strong",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          props.current ? "bg-accent" : "bg-line-strong",
        )}
      />

      <CheckpointLabel className="min-w-0 flex-1 truncate text-[13px]" />

      <CheckpointDiscardCount className="font-mono text-[11px] text-warning" />

      <CheckpointRestore
        className={cn(
          "shrink-0 rounded-chip border border-line px-2.5 py-1 text-[12px] transition-colors",
          "text-fg-muted hover:border-line-strong hover:text-fg",
          "disabled:pointer-events-none disabled:opacity-50",
          // Armed state has to be unmistakable, since the next press discards work.
          "data-[confirming]:border-danger data-[confirming]:bg-danger data-[confirming]:text-white",
        )}
      />
    </CheckpointPrimitive>
  );
}
