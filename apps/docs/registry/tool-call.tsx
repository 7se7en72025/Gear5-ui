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
} from "@gear5/core";
import type { ToolCallProps as ToolCallPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

const statusDot = {
  pending: "bg-fg-muted animate-pulse-soft",
  running: "bg-accent animate-pulse-soft",
  success: "bg-success",
  error: "bg-danger",
  cancelled: "bg-fg-muted",
} as const;

/** Styled tool call disclosure. */
export function ToolCall({ className, ...props }: ToolCallPrimitiveProps) {
  return (
    <ToolCallPrimitive
      className={cn(
        "overflow-hidden rounded-panel border border-line bg-panel",
        className,
      )}
      {...props}
    >
      <ToolCallTrigger
        className={cn(
          "group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
          "hover:bg-panel-raised disabled:pointer-events-none disabled:opacity-60",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("size-1.5 shrink-0 rounded-full", statusDot[props.status])}
        />
        <ToolCallName className="font-mono text-[13px] font-medium text-fg" />
        <ToolCallStatusText
          className={cn(
            "text-xs text-fg-muted",
            "data-[status=error]:text-danger",
          )}
        />
        <ToolCallDuration className="ml-auto font-mono text-xs tabular-nums text-fg-muted" />
        <span
          aria-hidden="true"
          className="text-fg-muted transition-transform group-data-[state=open]:rotate-90"
        >
          ›
        </span>
      </ToolCallTrigger>

      <ToolCallPanel className="border-t border-line">
        <ToolCallInput className="max-h-56 overflow-auto bg-panel-raised p-3 font-mono text-xs leading-relaxed" />
        <ToolCallOutput
          className={cn(
            "max-h-56 overflow-auto border-t border-line p-3 font-mono text-xs leading-relaxed",
            "data-[status=error]:text-danger",
          )}
        />
      </ToolCallPanel>
    </ToolCallPrimitive>
  );
}
