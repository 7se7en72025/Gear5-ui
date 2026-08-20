import type * as React from "react";
import { cn } from "./lib/utils";

export type BadgeTone = "neutral" | "accent" | "success" | "danger" | "warning";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-panel-raised text-fg-muted",
  accent: "bg-accent-soft text-accent",
  success: "bg-add-bg text-add",
  danger: "bg-del-bg text-del",
  warning: "bg-warning/10 text-warning",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/**
 * A label, not a button — no hover state, no click handler. Every other
 * coloured surface in this set means something is actionable or waiting on a
 * person; this one only means something is true right now.
 */
export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip px-2 py-0.5 text-[12px] font-medium",
        TONE[tone],
        className,
      )}
      {...rest}
    />
  );
}
