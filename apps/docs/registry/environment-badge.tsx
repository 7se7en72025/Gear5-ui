"use client";

import * as React from "react";
import {
  EnvironmentBadge as EnvironmentBadgePrimitive,
  EnvironmentName,
  EnvironmentWarning,
} from "@gear5/core";
import type { EnvironmentBadgeProps as EnvironmentBadgePrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/**
 * Production is loud and everything else is quiet. If every environment had a
 * colour then production would be just another colour, which defeats the point.
 */
const surface = {
  production: "border-danger/50 bg-danger/10 text-danger",
  staging: "border-warning/40 bg-warning/[0.07] text-warning",
  development: "border-line bg-panel text-fg-muted",
  sandbox: "border-line bg-panel text-fg-faint",
} as const;

/** Styled environment target badge. */
export function EnvironmentBadge({
  className,
  ...props
}: EnvironmentBadgePrimitiveProps) {
  const kind = props.environment.kind;

  return (
    <EnvironmentBadgePrimitive
      className={cn(
        "inline-flex items-center gap-2 rounded-full border py-1 pl-2.5 pr-3",
        "font-mono text-[11px]",
        surface[kind],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full bg-current",
          kind === "production" && "animate-pulse-soft",
        )}
      />
      <EnvironmentName />
      <EnvironmentWarning className="rounded-full bg-danger/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]" />
    </EnvironmentBadgePrimitive>
  );
}
