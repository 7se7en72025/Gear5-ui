"use client";

import * as React from "react";
import {
  TaskList as TaskListPrimitive,
  TaskListItem,
  TaskListItemLabel,
  TaskListItemStatus,
  TaskListItems,
  TaskListProgress,
} from "handoff-ui";
import type { TaskListProps as TaskListPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

const glyph = {
  pending: "○",
  active: "◐",
  done: "●",
  failed: "✕",
  skipped: "–",
} as const;

const itemStyles = {
  pending: "text-muted-foreground",
  active: "text-foreground font-medium",
  done: "text-muted-foreground line-through decoration-border",
  failed: "text-danger",
  skipped: "text-muted-foreground opacity-60",
} as const;

/** Styled agent plan. */
export function TaskList({ className, items, ...props }: TaskListPrimitiveProps) {
  return (
    <TaskListPrimitive
      items={items}
      className={cn("rounded-base border border-border bg-surface p-3", className)}
      {...props}
    >
      <div className="mb-2 flex items-center justify-between">
        {/* The list already carries this name via aria-label, so the visible
            heading is decoration and must not be announced a second time. */}
        <span
          aria-hidden="true"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          {props.label ?? "Plan"}
        </span>
        <TaskListProgress className="font-mono text-xs tabular-nums text-muted-foreground" />
      </div>

      <TaskListItems className="flex flex-col gap-1">
        {items.map((item) => (
          <TaskListItem
            key={item.id}
            item={item}
            className={cn("flex items-center gap-2 text-sm", itemStyles[item.status])}
          >
            <TaskListItemStatus
              className={cn(
                "shrink-0 text-xs",
                item.status === "active" && "animate-handoff-pulse text-brand",
                item.status === "done" && "text-success",
                item.status === "failed" && "text-danger",
              )}
            >
              {glyph[item.status]}
            </TaskListItemStatus>
            <TaskListItemLabel />
          </TaskListItem>
        ))}
      </TaskListItems>
    </TaskListPrimitive>
  );
}
