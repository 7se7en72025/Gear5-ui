"use client";

import type * as React from "react";
import {
  Feedback as FeedbackPrimitive,
  FeedbackButton,
} from "@gear5/core";
import type { FeedbackProps as FeedbackPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

function ThumbUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M7 8.5V17h7.2c.7 0 1.3-.5 1.4-1.2l1-5A1.5 1.5 0 0 0 15.1 9H11l.6-3.3A1.4 1.4 0 0 0 10.2 4L7 8.5Z"
        strokeLinejoin="round"
      />
      <path d="M3.5 8.5H7V17H3.5V8.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M13 11.5V3h-7.2c-.7 0-1.3.5-1.4 1.2l-1 5A1.5 1.5 0 0 0 4.9 11H9l-.6 3.3A1.4 1.4 0 0 0 9.8 16L13 11.5Z"
        strokeLinejoin="round"
      />
      <path d="M16.5 11.5H13V3h3.5v8.5Z" strokeLinejoin="round" />
    </svg>
  );
}

/** Styled rating on a single response, up or down. */
export function Feedback({ className, ...props }: FeedbackPrimitiveProps) {
  return (
    <FeedbackPrimitive
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      <FeedbackButton
        value="up"
        className={cn(
          "rounded-chip p-1.5 text-fg-faint transition-colors",
          "hover:bg-panel-raised hover:text-fg",
          "disabled:pointer-events-none disabled:opacity-40",
          "data-[pressed]:bg-add-bg data-[pressed]:text-add",
        )}
      >
        <ThumbUpIcon className="h-4 w-4" />
      </FeedbackButton>
      <FeedbackButton
        value="down"
        className={cn(
          "rounded-chip p-1.5 text-fg-faint transition-colors",
          "hover:bg-panel-raised hover:text-fg",
          "disabled:pointer-events-none disabled:opacity-40",
          "data-[pressed]:bg-del-bg data-[pressed]:text-del",
        )}
      >
        <ThumbDownIcon className="h-4 w-4" />
      </FeedbackButton>
    </FeedbackPrimitive>
  );
}
