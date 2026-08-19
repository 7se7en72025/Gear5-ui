"use client";

import * as React from "react";
import {
  Composer as ComposerPrimitive,
  ComposerCount,
  ComposerHint,
  ComposerInput,
  ComposerSubmit,
  ComposerToolbar,
} from "@gear5/core";
import type { ComposerProps as ComposerPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

export interface StyledComposerProps extends ComposerPrimitiveProps {
  placeholder?: string;
  /** Warn as the draft approaches this many characters. */
  maxLength?: number;
}

/** Styled prompt composer. */
export function Composer({
  className,
  placeholder = "Ask the agent…",
  maxLength,
  ...props
}: StyledComposerProps) {
  return (
    <ComposerPrimitive
      className={cn(
        "rounded-panel border border-line bg-panel p-2",
        "focus-within:border-line-strong",
        className,
      )}
      {...props}
    >
      <ComposerInput
        placeholder={placeholder}
        className={cn(
          "w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-6",
          "placeholder:text-fg-muted focus:outline-none",
          "disabled:opacity-50",
        )}
      />

      <ComposerToolbar className="mt-1 flex items-center gap-2 px-2 pb-0.5">
        <ComposerHint className="hidden text-[11px] text-fg-muted sm:block" />

        {/* Grouped so the trailing controls share one margin, rather than each
            claiming ml-auto and fighting over the gap. */}
        <div className="ml-auto flex items-center gap-2">
          <ComposerCount
            max={maxLength}
            className="text-[11px] text-fg-muted data-[over]:text-danger"
          />
          <ComposerSubmit
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              "bg-accent text-accent-fg hover:opacity-90",
              "disabled:pointer-events-none disabled:opacity-40",
              // Stopping a run is a different action, and should not look like send.
              "data-[busy]:bg-danger data-[busy]:text-white",
            )}
          />
        </div>
      </ComposerToolbar>
    </ComposerPrimitive>
  );
}
