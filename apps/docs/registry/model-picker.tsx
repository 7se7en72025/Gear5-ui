"use client";

import { ChevronDown } from "lucide-react";
import {
  ModelPicker as ModelPickerPrimitive,
  ModelPickerTrigger,
  ModelPickerList,
} from "@gear5/core";
import type { ModelPickerProps as ModelPickerPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/** Styled model selector — a listbox so each option can carry a description. */
export function ModelPicker({
  className,
  ...props
}: ModelPickerPrimitiveProps) {
  return (
    <ModelPickerPrimitive
      className={cn("relative inline-block", className)}
      {...props}
    >
      <ModelPickerTrigger
        className={cn(
          "flex items-center gap-2 rounded-chip border border-line bg-panel px-3 py-2 text-[13px]",
          "transition-colors hover:border-line-strong",
          "aria-expanded:border-accent",
        )}
      >
        <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-fg-faint" />
      </ModelPickerTrigger>
      <ModelPickerList
        className={cn(
          "absolute left-0 top-[calc(100%+6px)] z-20 w-72 overflow-hidden",
          "rounded-panel border border-line-strong bg-panel p-1 shadow-2xl",
          "[&_li]:flex [&_li]:cursor-pointer [&_li]:flex-col [&_li]:gap-0.5 [&_li]:rounded-chip [&_li]:px-3 [&_li]:py-2",
          "[&_li[data-active]]:bg-panel-raised",
          "[&_li[data-selected]]:text-accent",
          "[&_li[data-disabled]]:pointer-events-none [&_li[data-disabled]]:opacity-40",
          "[&_[data-handoff-slot=model-picker-option-label]]:text-[13px]",
          "[&_[data-handoff-slot=model-picker-option-description]]:text-[12px] [&_[data-handoff-slot=model-picker-option-description]]:text-fg-faint",
        )}
      />
    </ModelPickerPrimitive>
  );
}
