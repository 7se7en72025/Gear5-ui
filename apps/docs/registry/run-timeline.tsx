"use client";

import * as React from "react";
import {
  RunTimeline as RunTimelinePrimitive,
  RunStep as RunStepPrimitive,
  RunStepContent,
  RunStepMarker,
} from "@gear5/core";
import type {
  RunTimelineProps as RunTimelinePrimitiveProps,
  RunStepProps as RunStepPrimitiveProps,
} from "@gear5/core";
import { cn } from "./lib/utils";

/** Styled trace of agent steps. */
export function RunTimeline({ className, ...props }: RunTimelinePrimitiveProps) {
  return (
    <RunTimelinePrimitive
      className={cn("flex flex-col gap-0", className)}
      {...props}
    />
  );
}

const markerStyles = {
  pending: "border-line bg-panel",
  active: "border-accent bg-accent animate-pulse-soft",
  done: "border-success bg-success",
  failed: "border-danger bg-danger",
  skipped: "border-line bg-panel opacity-50",
} as const;

/** One step, with a connecting rail drawn between markers. */
export function RunStep({ className, children, ...props }: RunStepPrimitiveProps) {
  const status = props.status ?? "pending";

  return (
    <RunStepPrimitive
      className={cn("relative flex gap-3 pb-4 last:pb-0", className)}
      {...props}
    >
      {/* The rail is decorative and must not reach past the final marker. */}
      <span
        aria-hidden="true"
        className="absolute left-[5px] top-4 h-[calc(100%-1rem)] w-px bg-line [li:last-child_&]:hidden"
      />
      <RunStepMarker
        className={cn(
          "relative z-10 mt-1 size-[11px] shrink-0 rounded-full border-2",
          markerStyles[status],
        )}
      />
      <RunStepContent className="min-w-0 flex-1">{children}</RunStepContent>
    </RunStepPrimitive>
  );
}
