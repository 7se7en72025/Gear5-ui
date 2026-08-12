"use client";

import * as React from "react";
import {
  Reasoning as ReasoningPrimitive,
  ReasoningLabel,
  ReasoningPanel,
  ReasoningText,
  ReasoningTrigger,
} from "handoff-ui";
import type { ReasoningProps as ReasoningPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled collapsible reasoning block. */
export function Reasoning({ className, ...props }: ReasoningPrimitiveProps) {
  return (
    <ReasoningPrimitive className={cn("text-sm", className)} {...props}>
      <ReasoningTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-fg-muted transition-colors",
          "hover:text-fg",
          "data-[streaming]:animate-pulse-soft",
        )}
      >
        <span aria-hidden="true">✳</span>
        <ReasoningLabel />
      </ReasoningTrigger>

      <ReasoningPanel className="mt-1 border-l-2 border-line pl-3">
        <ReasoningText className="whitespace-pre-wrap text-[13px] leading-relaxed text-fg-muted" />
      </ReasoningPanel>
    </ReasoningPrimitive>
  );
}
