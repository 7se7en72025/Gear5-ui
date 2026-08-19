"use client";

import * as React from "react";
import {
  Attachment as AttachmentPrimitive,
  AttachmentList as AttachmentListPrimitive,
  AttachmentMeta,
  AttachmentName,
  AttachmentProgress,
  AttachmentRemove,
} from "@gear5/core";
import type { AttachmentFile } from "@gear5/core";
import { cn } from "./lib/utils";

export interface AttachmentListProps {
  files: readonly AttachmentFile[];
  onRemove?: (file: AttachmentFile) => void;
  className?: string;
}

/** Styled attachment chips. */
export function AttachmentList({
  files,
  onRemove,
  className,
}: AttachmentListProps) {
  return (
    <AttachmentListPrimitive className={cn("flex flex-wrap gap-2", className)}>
      {files.map((file) => (
        <AttachmentPrimitive
          key={file.id}
          file={file}
          onRemove={onRemove}
          className={cn(
            "group relative flex items-center gap-2 overflow-hidden rounded-chip border px-2.5 py-1.5",
            "border-line bg-panel text-[12px]",
            "data-[status=error]:border-danger/50",
          )}
        >
          <AttachmentName className="max-w-[11rem] truncate font-mono text-fg" />
          <AttachmentMeta
            className={cn(
              "shrink-0 text-fg-faint",
              "data-[status=error]:text-danger",
            )}
          />

          <AttachmentRemove
            className={cn(
              "shrink-0 rounded px-1 text-fg-faint transition-colors hover:text-danger",
            )}
          >
            <span aria-hidden="true">x</span>
          </AttachmentRemove>

          {/* Fill is published as a variable by the primitive. */}
          <AttachmentProgress className="absolute inset-x-0 bottom-0 h-0.5 bg-line">
            <span
              aria-hidden="true"
              className="block h-full bg-accent transition-[width] duration-300"
              style={{ width: "calc(var(--handoff-upload-fill, 0) * 100%)" }}
            />
          </AttachmentProgress>
        </AttachmentPrimitive>
      ))}
    </AttachmentListPrimitive>
  );
}
