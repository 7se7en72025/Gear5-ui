"use client";

import * as React from "react";
import {
  Guardrail as GuardrailPrimitive,
  GuardrailAction,
  GuardrailExplanation,
  GuardrailOverride,
  GuardrailPayload,
  GuardrailRule,
} from "@gear5/core";
import type { GuardrailProps as GuardrailPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/** Styled policy block. */
export function Guardrail({ className, ...props }: GuardrailPrimitiveProps) {
  return (
    <GuardrailPrimitive
      className={cn(
        "rounded-panel border border-warning/35 bg-warning/[0.05] p-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <GuardrailAction className="text-sm font-medium text-fg" />
            <GuardrailRule className="rounded-full border border-warning/40 px-2 py-0.5 font-mono text-[10px] text-warning" />
          </div>

          <GuardrailExplanation className="mt-1.5 text-[13px] leading-relaxed text-fg-muted" />

          <GuardrailPayload
            className={cn(
              "mt-3",
              "[&_button]:rounded-chip [&_button]:border [&_button]:border-line [&_button]:px-2 [&_button]:py-1",
              "[&_button]:font-mono [&_button]:text-[11px] [&_button]:text-fg-muted",
              "[&_button:hover]:text-fg",
              "[&_pre]:mt-2 [&_pre]:max-h-40 [&_pre]:overflow-auto [&_pre]:rounded-chip",
              "[&_pre]:bg-bg/60 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[11px] [&_pre]:leading-relaxed",
            )}
          />

          <GuardrailOverride
            className={cn(
              "mt-3 rounded-chip border border-line px-3 py-1.5 text-[12px]",
              "text-fg-muted transition-colors",
              "hover:border-danger/50 hover:text-danger",
            )}
          />
        </div>
      </div>
    </GuardrailPrimitive>
  );
}
