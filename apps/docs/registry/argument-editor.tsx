"use client";

import * as React from "react";
import {
  ArgumentEditor as ArgumentEditorPrimitive,
  ArgumentEditorReset,
  ArgumentField,
  ArgumentFields,
} from "@gear5/core";
import type { ArgumentEditorProps as ArgumentEditorPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/** Styled editor for the arguments of a pending tool call. */
export function ArgumentEditor({
  className,
  ...props
}: ArgumentEditorPrimitiveProps) {
  const keys = Object.keys(props.values);

  return (
    <ArgumentEditorPrimitive
      className={cn(
        "overflow-hidden rounded-panel border border-line bg-panel",
        className,
      )}
      {...props}
    >
      <ArgumentFields className="divide-y divide-line">
        {keys.map((key) => (
          <ArgumentField
            key={key}
            name={key}
            className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-2.5",
              // An edited row is tinted so the change is findable in a long
              // argument list without reading every value.
              "data-[dirty]:bg-accent/[0.06]",
              // The label sits in a fixed column so the inputs line up.
              "[&_[data-handoff-slot=arg-label]]:w-28 [&_[data-handoff-slot=arg-label]]:shrink-0",
              "[&_[data-handoff-slot=arg-label]]:font-mono [&_[data-handoff-slot=arg-label]]:text-[12px]",
              "[&_[data-handoff-slot=arg-label]]:text-fg-muted",
              // Inputs.
              "[&_[data-handoff-slot=arg-input]]:min-w-0 [&_[data-handoff-slot=arg-input]]:flex-1",
              "[&_[data-handoff-slot=arg-input][type=text]]:rounded-chip [&_[data-handoff-slot=arg-input][type=number]]:rounded-chip",
              "[&_[data-handoff-slot=arg-input][type=text]]:border [&_[data-handoff-slot=arg-input][type=number]]:border",
              "[&_[data-handoff-slot=arg-input][type=text]]:border-line [&_[data-handoff-slot=arg-input][type=number]]:border-line",
              "[&_[data-handoff-slot=arg-input][type=text]]:bg-bg [&_[data-handoff-slot=arg-input][type=number]]:bg-bg",
              "[&_[data-handoff-slot=arg-input][type=text]]:px-2.5 [&_[data-handoff-slot=arg-input][type=number]]:px-2.5",
              "[&_[data-handoff-slot=arg-input][type=text]]:py-1.5 [&_[data-handoff-slot=arg-input][type=number]]:py-1.5",
              "[&_[data-handoff-slot=arg-input]]:font-mono [&_[data-handoff-slot=arg-input]]:text-[12px]",
              "[&_[data-handoff-slot=arg-input][type=checkbox]]:size-4 [&_[data-handoff-slot=arg-input][type=checkbox]]:flex-none",
              "[&_[data-handoff-slot=arg-input][type=checkbox]]:accent-[var(--accent)]",
              // Read only nested values.
              "[&_[data-handoff-slot=arg-readonly]]:min-w-0 [&_[data-handoff-slot=arg-readonly]]:flex-1",
              "[&_[data-handoff-slot=arg-readonly]]:overflow-auto [&_[data-handoff-slot=arg-readonly]]:rounded-chip",
              "[&_[data-handoff-slot=arg-readonly]]:bg-bg/60 [&_[data-handoff-slot=arg-readonly]]:p-2",
              "[&_[data-handoff-slot=arg-readonly]]:font-mono [&_[data-handoff-slot=arg-readonly]]:text-[11px]",
              "[&_[data-handoff-slot=arg-readonly]]:text-fg-faint",
              // What the model proposed, struck through beside the edit.
              "[&_[data-handoff-slot=arg-original]]:font-mono [&_[data-handoff-slot=arg-original]]:text-[11px]",
              "[&_[data-handoff-slot=arg-original]]:text-fg-faint",
              "[&_[data-handoff-slot=arg-original]>span[aria-hidden]]:line-through",
              // Per field reset.
              "[&_[data-handoff-slot=arg-reset]]:rounded [&_[data-handoff-slot=arg-reset]]:px-1.5",
              "[&_[data-handoff-slot=arg-reset]]:text-[11px] [&_[data-handoff-slot=arg-reset]]:text-fg-faint",
              "[&_[data-handoff-slot=arg-reset]:hover]:text-fg",
            )}
          />
        ))}
      </ArgumentFields>

      <ArgumentEditorReset
        className={cn(
          "w-full border-t border-line px-3.5 py-2 text-left text-[12px]",
          "text-fg-muted transition-colors hover:bg-panel-raised hover:text-fg",
        )}
      />
    </ArgumentEditorPrimitive>
  );
}
