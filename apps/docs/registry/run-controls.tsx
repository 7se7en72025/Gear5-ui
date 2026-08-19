"use client";

import * as React from "react";
import { RunControlButton, RunControls as RunControlsPrimitive } from "@gear5/core";
import type { RunControlsProps as RunControlsPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

const base = cn(
  "rounded-chip border border-line bg-panel px-2.5 py-1.5 text-[12px]",
  "text-fg-muted transition-colors",
  "hover:border-line-strong hover:text-fg",
  "disabled:pointer-events-none disabled:opacity-40",
);

/** Styled run transport controls. */
export function RunControls({ className, ...props }: RunControlsPrimitiveProps) {
  return (
    <RunControlsPrimitive
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      <RunControlButton action="pause" className={base} />
      <RunControlButton action="resume" className={base} />
      <RunControlButton action="step" className={base} />
      <RunControlButton
        action="stop"
        className={cn(base, "hover:border-danger/60 hover:text-danger")}
      />
    </RunControlsPrimitive>
  );
}
