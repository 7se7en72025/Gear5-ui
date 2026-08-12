"use client";

import * as React from "react";
import {
  Citation as CitationPrimitive,
  CitationCard,
  CitationLink,
  CitationSnippet,
  CitationTitle,
  CitationTrigger,
} from "handoff-ui";
import type { CitationProps as CitationPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled inline source reference. */
export function Citation({ className, ...props }: CitationPrimitiveProps) {
  return (
    <CitationPrimitive className={cn("relative inline-block", className)} {...props}>
      <CitationTrigger
        className={cn(
          "mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded px-1",
          "align-super text-[10px] font-medium leading-none",
          "bg-panel-raised text-fg-muted transition-colors",
          "hover:bg-accent hover:text-accent-fg",
          "data-[state=open]:bg-accent data-[state=open]:text-accent-fg",
        )}
      />

      <CitationCard
        className={cn(
          "animate-rise absolute left-0 top-full z-20 mt-1 w-72",
          "rounded-panel border border-line bg-panel p-3 shadow-lg",
        )}
      >
        <CitationTitle className="text-sm font-medium text-fg" />
        <CitationSnippet className="mt-1.5 border-l-2 border-line pl-2 text-xs leading-relaxed text-fg-muted" />
        <CitationLink className="mt-2 block truncate text-xs text-accent underline underline-offset-2" />
      </CitationCard>
    </CitationPrimitive>
  );
}
