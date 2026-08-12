"use client";

import * as React from "react";
import {
  Artifact as ArtifactPrimitive,
  ArtifactContent,
  ArtifactHeader,
  ArtifactStaleNotice,
  ArtifactTitle,
  ArtifactVersionCount,
  ArtifactVersionSelect,
} from "handoff-ui";
import type { ArtifactProps as ArtifactPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled artifact panel with version history. */
export function Artifact({ className, ...props }: ArtifactPrimitiveProps) {
  return (
    <ArtifactPrimitive
      className={cn(
        "overflow-hidden rounded-panel border border-line bg-panel",
        className,
      )}
      {...props}
    >
      <ArtifactHeader className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <ArtifactTitle className="font-mono text-[13px] font-medium text-fg" />
        <ArtifactVersionCount className="text-xs text-fg-muted" />
        <ArtifactVersionSelect
          className={cn(
            "ml-auto rounded-md border border-line bg-panel px-2 py-1 text-xs",
            "text-fg-muted",
          )}
        />
      </ArtifactHeader>

      <ArtifactStaleNotice className="border-b border-warning/40 bg-warning/10 px-3 py-1.5 text-xs text-warning" />

      <ArtifactContent className="max-h-80 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed" />
    </ArtifactPrimitive>
  );
}
