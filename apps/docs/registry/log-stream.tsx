"use client";

import * as React from "react";
import {
  LogStream as LogStreamPrimitive,
  LogStreamFollowButton,
  LogStreamLines,
  LogStreamViewport,
} from "@gear5/core";
import type { LogStreamProps as LogStreamPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/**
 * Styled process output.
 *
 * The `data-fg` attributes the primitive emits for the 16 named ANSI colours
 * are mapped to theme tokens here, so terminal output matches the rest of your
 * UI instead of hard-coding terminal green.
 */
export function LogStream({ className, ...props }: LogStreamPrimitiveProps) {
  return (
    <LogStreamPrimitive
      className={cn(
        "relative overflow-hidden rounded-panel border border-line bg-panel",
        className,
      )}
      {...props}
    >
      <LogStreamViewport
        className={cn(
          "max-h-72 overflow-auto p-3 font-mono text-xs leading-[1.6]",
          // Named ANSI colours, themed.
          "[&_[data-fg=black]]:text-fg-muted",
          "[&_[data-fg=red]]:text-danger [&_[data-fg=bright-red]]:text-danger",
          "[&_[data-fg=green]]:text-success [&_[data-fg=bright-green]]:text-success",
          "[&_[data-fg=yellow]]:text-warning [&_[data-fg=bright-yellow]]:text-warning",
          "[&_[data-fg=blue]]:text-accent [&_[data-fg=bright-blue]]:text-accent",
          "[&_[data-fg=magenta]]:text-accent [&_[data-fg=cyan]]:text-accent",
          "[&_[data-fg=white]]:text-fg [&_[data-fg=bright-white]]:text-fg",
        )}
      >
        <LogStreamLines
          className={cn(
            "whitespace-pre-wrap break-all",
            "[&_[data-stream=stderr]]:text-danger",
          )}
        />
      </LogStreamViewport>

      <LogStreamFollowButton
        className={cn(
          "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full",
          "border border-line bg-panel px-3 py-1 text-xs shadow-sm",
          "transition-colors hover:bg-panel-raised",
        )}
      />
    </LogStreamPrimitive>
  );
}
