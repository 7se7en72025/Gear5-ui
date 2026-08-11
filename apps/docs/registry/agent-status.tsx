"use client";

import * as React from "react";
import {
  AgentStatus as AgentStatusPrimitive,
  AgentStatusIndicator,
  AgentStatusLabel,
} from "handoff-ui";
import type { AgentStatusProps as AgentStatusPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

const indicatorStyles = {
  idle: "bg-muted-foreground",
  thinking: "bg-brand animate-handoff-pulse",
  running: "bg-brand animate-handoff-pulse",
  waiting: "bg-warning animate-handoff-pulse",
  error: "bg-danger",
  done: "bg-success",
} as const;

/** Styled agent status pill. */
export function AgentStatus({ className, ...props }: AgentStatusPrimitiveProps) {
  return (
    <AgentStatusPrimitive
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1",
        className,
      )}
      {...props}
    >
      <AgentStatusIndicator
        className={cn("size-1.5 rounded-full", indicatorStyles[props.status])}
      />
      <AgentStatusLabel className="text-xs text-muted-foreground" />
    </AgentStatusPrimitive>
  );
}
