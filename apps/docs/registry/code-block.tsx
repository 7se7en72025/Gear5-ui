"use client";

import * as React from "react";
import {
  CodeBlock as CodeBlockPrimitive,
  CodeBlockBody,
  CodeBlockCopy,
  CodeBlockHeader,
  CodeBlockLabel,
} from "@gear5/core";
import type { CodeBlockProps as CodeBlockPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

export interface StyledCodeBlockProps extends CodeBlockPrimitiveProps {
  showLineNumbers?: boolean;
  /** Drop the header when the block is a bare one liner. */
  bare?: boolean;
}

/** Styled code block with copy. */
export function CodeBlock({
  className,
  showLineNumbers = false,
  bare = false,
  ...props
}: StyledCodeBlockProps) {
  return (
    <CodeBlockPrimitive
      className={cn(
        "group overflow-hidden rounded-panel border border-line bg-panel",
        className,
      )}
      {...props}
    >
      {bare ? null : (
        <CodeBlockHeader className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
          <CodeBlockLabel className="font-mono text-xs text-fg-muted" />
          <CopyButton />
        </CodeBlockHeader>
      )}

      <div className="relative">
        {bare ? (
          <div className="absolute right-2 top-2 z-10">
            <CopyButton />
          </div>
        ) : null}

        <CodeBlockBody
          showLineNumbers={showLineNumbers}
          className={cn(
            "overflow-x-auto p-4 font-mono text-[13px] leading-relaxed",
            bare && "pr-20",
            // The gutter is a child span, so it is styled from here.
            showLineNumbers &&
              "[&_[data-handoff-slot=code-line]]:table-row [&_code]:table [&_code]:w-full",
            showLineNumbers &&
              "[&_[data-handoff-slot=code-gutter]]:table-cell [&_[data-handoff-slot=code-gutter]]:w-8 [&_[data-handoff-slot=code-gutter]]:select-none [&_[data-handoff-slot=code-gutter]]:pr-4 [&_[data-handoff-slot=code-gutter]]:text-right [&_[data-handoff-slot=code-gutter]]:text-fg-faint",
          )}
        />
      </div>
    </CodeBlockPrimitive>
  );
}

function CopyButton() {
  return (
    <CodeBlockCopy
      className={cn(
        "rounded-chip border border-line bg-panel-raised px-2 py-1",
        "font-mono text-[11px] text-fg-muted transition-colors",
        "hover:border-line-strong hover:text-fg",
        "data-[state=copied]:border-success/50 data-[state=copied]:text-success",
        "data-[state=error]:border-danger/50 data-[state=error]:text-danger",
      )}
    />
  );
}
