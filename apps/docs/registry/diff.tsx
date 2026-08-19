"use client";

import * as React from "react";
import {
  Diff as DiffPrimitive,
  DiffBody,
  DiffHeader,
  DiffPath,
  DiffStat,
} from "@gear5/core";
import type { DiffProps as DiffPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

export interface DiffProps extends DiffPrimitiveProps {
  /** Hide unchanged lines beyond this many either side of a change. */
  contextLines?: number;
  /** Show original and result line numbers in a gutter. */
  showLineNumbers?: boolean;
}

/** Styled line diff. */
export function Diff({
  className,
  contextLines,
  showLineNumbers = true,
  ...props
}: DiffProps) {
  return (
    <DiffPrimitive
      className={cn(
        "overflow-hidden rounded-panel border border-line bg-panel",
        className,
      )}
      {...props}
    >
      <DiffHeader className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <DiffPath className="font-mono text-[13px] text-fg" />
        <DiffStat className="font-mono text-xs tabular-nums text-fg-muted" />
      </DiffHeader>

      <DiffBody
        contextLines={contextLines}
        className="max-h-96 overflow-auto py-1 font-mono text-xs leading-[1.7]"
        renderLine={(line, index) => (
          <li
            key={index}
            data-type={line.type}
            className={cn(
              "flex gap-3 px-3",
              line.type === "add" && "bg-add-bg text-add",
              line.type === "remove" && "bg-del-bg text-del",
              line.type === "context" && "text-fg-muted",
            )}
          >
            {showLineNumbers ? (
              <span
                aria-hidden="true"
                className="w-10 shrink-0 select-none text-right tabular-nums opacity-50"
              >
                {line.afterLine ?? line.beforeLine}
              </span>
            ) : null}
            <span aria-hidden="true" className="w-2 shrink-0 select-none">
              {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
            </span>
            {/* The spoken prefix the primitive would normally add is recreated
                here, since renderLine replaces its markup entirely. */}
            <span className="sr-only">
              {line.type === "add" ? "Added" : line.type === "remove" ? "Removed" : ""}
            </span>
            <span className="whitespace-pre-wrap break-all">{line.content || " "}</span>
          </li>
        )}
      />
    </DiffPrimitive>
  );
}
