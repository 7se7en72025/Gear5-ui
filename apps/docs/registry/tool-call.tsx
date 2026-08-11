"use client";

import * as React from "react";
import {
  ToolCall as ToolCallPrimitive,
  ToolCallDuration,
  ToolCallInput,
  ToolCallName,
  ToolCallOutput,
  ToolCallPanel,
  ToolCallStatusText,
  ToolCallTrigger,
} from "handoff-ui";
import type { ToolCallProps as ToolCallPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

const statusDot = {
  pending: "bg-muted-foreground animate-handoff-pulse",
  running: "bg-brand animate-handoff-pulse",
  success: "bg-success",
  error: "bg-danger",
  cancelled: "bg-muted-foreground",
} as const;

/** Styled tool call disclosure. */
export function ToolCall({ className, ...props }: ToolCallPrimitiveProps) {
  return (
    <ToolCallPrimitive
      className={cn(
        "overflow-hidden rounded-base border border-border bg-surface",
        className,
      )}
      {...props}
    >
      <ToolCallTrigger
        className={cn(
          "group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
          "hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-60",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("size-1.5 shrink-0 rounded-full", statusDot[props.status])}
        />
        <ToolCallName className="font-mono text-[13px] font-medium text-foreground" />
        <ToolCallStatusText
          className={cn(
            "text-xs text-muted-foreground",
            "data-[status=error]:text-danger",
          )}
        />
        <ToolCallDuration className="ml-auto font-mono text-xs tabular-nums text-muted-foreground" />
        <span
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
        >
          ›
        </span>
      </ToolCallTrigger>

      <ToolCallPanel className="border-t border-border">
        <ToolCallInput className="max-h-56 overflow-auto bg-surface-muted p-3 font-mono text-xs leading-relaxed" />
        <ToolCallOutput
          className={cn(
            "max-h-56 overflow-auto border-t border-border p-3 font-mono text-xs leading-relaxed",
            "data-[status=error]:text-danger",
          )}
        />
      </ToolCallPanel>
    </ToolCallPrimitive>
  );
}
