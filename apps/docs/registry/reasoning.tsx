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
          "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors",
          "hover:text-foreground",
          "data-[streaming]:animate-handoff-pulse",
        )}
      >
        <span aria-hidden="true">✳</span>
        <ReasoningLabel />
      </ReasoningTrigger>

      <ReasoningPanel className="mt-1 border-l-2 border-border pl-3">
        <ReasoningText className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground" />
      </ReasoningPanel>
    </ReasoningPrimitive>
  );
}
