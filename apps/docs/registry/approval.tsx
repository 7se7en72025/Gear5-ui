"use client";

import * as React from "react";
import {
  Approval as ApprovalPrimitive,
  ApprovalAction,
  ApprovalActions,
  ApprovalAlways,
  ApprovalApprove,
  ApprovalCountdown,
  ApprovalDeny,
  ApprovalDetail,
  ApprovalOutcome,
  ApprovalPayload,
  ApprovalRisk,
} from "@gear5/core";
import type { ApprovalProps as ApprovalPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/**
 * Styled human-in-the-loop gate.
 *
 * Behaviour, ARIA, and the confirm flow live in the primitive; this file is
 * only appearance, so you can rewrite it freely without breaking either.
 */
export interface ApprovalProps extends ApprovalPrimitiveProps {
  /** Show an "Always allow" option alongside approve and deny. */
  allowAlways?: boolean;
}

const riskStyles = {
  low: "text-risk-low border-line",
  medium: "text-risk-medium border-warning/40",
  high: "text-risk-high border-danger/50",
} as const;

export function Approval({
  className,
  allowAlways = false,
  ...props
}: ApprovalProps) {
  const risk = props.risk ?? "medium";

  return (
    <ApprovalPrimitive
      className={cn(
        "animate-rise rounded-panel border bg-panel p-4 shadow-sm",
        "data-[status=denied]:opacity-60 data-[status=expired]:opacity-60",
        riskStyles[risk],
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <ApprovalAction className="text-sm font-medium text-fg" />
        <div className="flex shrink-0 items-center gap-2">
          <ApprovalRisk
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
              "data-[risk=low]:border-line data-[risk=low]:text-fg-muted",
              "data-[risk=medium]:border-warning/40 data-[risk=medium]:text-warning",
              "data-[risk=high]:border-danger/50 data-[risk=high]:text-danger",
            )}
          />
          <ApprovalCountdown className="font-mono text-xs tabular-nums text-fg-muted" />
        </div>
      </div>

      <ApprovalDetail className="mt-1.5 text-sm text-fg-muted" />

      <ApprovalPayload className="mt-3 max-h-40 overflow-auto rounded-md bg-panel-raised p-3 font-mono text-xs leading-relaxed text-fg" />

      <ApprovalActions className="mt-4 flex flex-wrap items-center gap-2">
        <ApprovalApprove
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            "bg-accent text-accent-fg hover:opacity-90",
            "disabled:pointer-events-none disabled:opacity-40",
            // The armed state has to be unmistakable, not a subtle tint.
            "data-[confirming]:bg-danger data-[confirming]:text-white",
          )}
        />
        <ApprovalDeny
          className={cn(
            "rounded-md border border-line px-3 py-1.5 text-sm font-medium transition-colors",
            "hover:bg-panel-raised disabled:pointer-events-none disabled:opacity-40",
          )}
        />
        {allowAlways ? (
          <ApprovalAlways
            className={cn(
              "rounded-md px-3 py-1.5 text-sm text-fg-muted transition-colors",
              "hover:text-fg disabled:pointer-events-none disabled:opacity-40",
            )}
          />
        ) : null}

        <ApprovalOutcome
          className={cn(
            "ml-auto text-sm font-medium",
            "data-[status=approved]:text-success",
            "data-[status=denied]:text-danger",
            "data-[status=expired]:text-fg-muted",
          )}
        />
      </ApprovalActions>
    </ApprovalPrimitive>
  );
}
