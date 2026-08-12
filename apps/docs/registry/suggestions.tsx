"use client";

import * as React from "react";
import {
  SuggestionItem,
  Suggestions as SuggestionsPrimitive,
} from "handoff-ui";
import type { SuggestionsProps as SuggestionsPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled prompt suggestions. */
export function Suggestions({
  className,
  items,
  ...props
}: SuggestionsPrimitiveProps) {
  return (
    <SuggestionsPrimitive
      items={items}
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    >
      {items.map((item, index) => (
        <SuggestionItem
          key={item.id}
          item={item}
          index={index}
          className={cn(
            "rounded-chip border border-line bg-panel px-3 py-1.5 text-[13px]",
            "text-fg-muted transition-colors",
            "hover:border-line-strong hover:text-fg",
            "data-[active]:border-line-strong",
          )}
        />
      ))}
    </SuggestionsPrimitive>
  );
}
