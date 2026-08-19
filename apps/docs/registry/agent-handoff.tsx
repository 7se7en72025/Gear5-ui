"use client";

import * as React from "react";
import {
  AgentHandoff as AgentHandoffPrimitive,
  AgentHandoffArrow,
  AgentHandoffFrom,
  AgentHandoffReason,
  AgentHandoffTo,
} from "@gear5/core";
import type { AgentHandoffProps as AgentHandoffPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/** Styled agent to agent transfer. */
export function AgentHandoff({
  className,
  ...props
}: AgentHandoffPrimitiveProps) {
  return (
    <AgentHandoffPrimitive
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-panel border border-dashed border-line",
        "bg-panel/50 px-3 py-2 text-[13px]",
        className,
      )}
      {...props}
    >
      <AgentHandoffFrom className="font-mono text-fg-muted" />
      <AgentHandoffArrow className="text-fg-faint" />
      <AgentHandoffTo className="font-mono text-accent" />
      <AgentHandoffReason className="text-fg-faint">
        {props.reason ? `(${props.reason})` : undefined}
      </AgentHandoffReason>
    </AgentHandoffPrimitive>
  );
}
