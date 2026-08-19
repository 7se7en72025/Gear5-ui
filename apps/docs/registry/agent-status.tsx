"use client";

import * as React from "react";
import {
  AgentStatus as AgentStatusPrimitive,
  AgentStatusIndicator,
  AgentStatusLabel,
} from "@gear5/core";
import type { AgentStatusProps as AgentStatusPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

const indicatorStyles = {
  idle: "bg-fg-muted",
  thinking: "bg-accent animate-pulse-soft",
  running: "bg-accent animate-pulse-soft",
  waiting: "bg-warning animate-pulse-soft",
  error: "bg-danger",
  done: "bg-success",
} as const;

/** Styled agent status pill. */
export function AgentStatus({ className, ...props }: AgentStatusPrimitiveProps) {
  return (
    <AgentStatusPrimitive
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-panel px-2.5 py-1",
        className,
      )}
      {...props}
    >
      <AgentStatusIndicator
        className={cn("size-1.5 rounded-full", indicatorStyles[props.status])}
      />
      <AgentStatusLabel className="text-xs text-fg-muted" />
    </AgentStatusPrimitive>
  );
}
