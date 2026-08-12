"use client";

import * as React from "react";
import {
  StreamingText as StreamingTextPrimitive,
  StreamingTextBody,
  StreamingTextCaret,
} from "handoff-ui";
import type { StreamingTextProps as StreamingTextPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled streaming model output. */
export function StreamingText({
  className,
  ...props
}: StreamingTextPrimitiveProps) {
  return (
    <StreamingTextPrimitive
      className={cn("text-[15px] leading-relaxed", className)}
      {...props}
    >
      {/* Inline so the caret sits on the last line rather than dropping below. */}
      <StreamingTextBody className="inline whitespace-pre-wrap" />
      <StreamingTextCaret className="animate-caret ml-0.5 inline-block text-accent" />
    </StreamingTextPrimitive>
  );
}
