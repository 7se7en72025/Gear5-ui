import * as React from "react";
import type { TaskItem } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface TaskListContextValue {
  items: readonly TaskItem[];
  done: number;
  total: number;
  label: string;
}

const [TaskListProvider, useTaskListContext] =
  createContext<TaskListContextValue>("TaskList");

interface TaskItemContextValue {
  item: TaskItem;
}

const [TaskItemProvider, useTaskItemContext] =
  createContext<TaskItemContextValue>("TaskListItem");

/** Read the enclosing task list's counts. */
export function useTaskList(): TaskListContextValue {
  return useTaskListContext("useTaskList");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface TaskListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The plan. Agents revise this mid-run, so it is always fully controlled. */
  items: readonly TaskItem[];
  label?: string;
  asChild?: boolean;
}

/**
 * The agent's plan, with live status per item.
 *
 * The root is a plain container rather than the list itself, so progress text
 * and other chrome can sit alongside `<TaskListItems>` without putting invalid
 * non-`<li>` children inside a list.
 *
 * ```tsx
 * <TaskList items={items} label="Plan">
 *   <TaskListProgress />
 *   <TaskListItems>
 *     {items.map((item) => (
 *       <TaskListItem key={item.id} item={item}>
 *         <TaskListItemStatus />
 *         <TaskListItemLabel />
 *       </TaskListItem>
 *     ))}
 *   </TaskListItems>
 * </TaskList>
 * ```
 */
export const TaskList = React.forwardRef<HTMLDivElement, TaskListProps>(
  function TaskList({ items, label = "Plan", asChild = false, children, ...rest }, forwardedRef) {
    const done = React.useMemo(
      () => items.filter((item) => item.status === "done").length,
      [items],
    );

    const context: TaskListContextValue = {
      items,
      done,
      total: items.length,
      label,
    };

    const Comp = resolveElement(asChild, "div");

    return (
      <TaskListProvider value={context}>
        <Comp ref={forwardedRef} data-handoff-part="task-list" {...rest}>
          {children}
        </Comp>
      </TaskListProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Items
 * ---------------------------------------------------------------------- */

export interface TaskListItemsProps
  extends React.HTMLAttributes<HTMLUListElement> {
  asChild?: boolean;
}

/**
 * The `<ul>` holding the items.
 *
 * Named with `aria-label` rather than a hidden label element: styled versions
 * almost always render their own visible "Plan" heading, and a hidden twin
 * would have screen readers announce the word twice.
 */
export const TaskListItems = React.forwardRef<HTMLUListElement, TaskListItemsProps>(
  function TaskListItems({ asChild = false, ...rest }, forwardedRef) {
    const { label } = useTaskListContext("TaskListItems");
    const Comp = resolveElement(asChild, "ul");
    return <Comp ref={forwardedRef} aria-label={label} {...rest} />;
  },
);

export interface TaskListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  item: TaskItem;
  asChild?: boolean;
}

/** One task. */
export const TaskListItem = React.forwardRef<HTMLLIElement, TaskListItemProps>(
  function TaskListItem({ item, asChild = false, children, ...rest }, forwardedRef) {
    const Comp = resolveElement(asChild, "li");
    return (
      <TaskItemProvider value={{ item }}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="task"
          data-status={item.status}
          aria-current={item.status === "active" ? "step" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </TaskItemProvider>
    );
  },
);

const TASK_STATUS_LABEL: Record<TaskItem["status"], string> = {
  pending: "To do",
  active: "In progress",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

export interface TaskListItemStatusProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  labels?: Partial<Record<TaskItem["status"], string>>;
  asChild?: boolean;
}

/**
 * The status glyph. The visual is hidden and replaced with text, so a
 * checkmark or spinner still reads as "Done" or "In progress".
 */
export const TaskListItemStatus = React.forwardRef<
  HTMLSpanElement,
  TaskListItemStatusProps
>(function TaskListItemStatus({ labels, asChild = false, children, ...rest }, forwardedRef) {
  const { item } = useTaskItemContext("TaskListItemStatus");
  const Comp = resolveElement(asChild, "span");

  return (
    <Comp ref={forwardedRef} data-status={item.status} data-handoff-slot="task-status" {...rest}>
      <span aria-hidden="true">{children}</span>
      <span style={visuallyHidden}>
        {labels?.[item.status] ?? TASK_STATUS_LABEL[item.status]}
      </span>
    </Comp>
  );
});

export interface TaskListItemLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The task text. */
export const TaskListItemLabel = React.forwardRef<
  HTMLSpanElement,
  TaskListItemLabelProps
>(function TaskListItemLabel({ asChild = false, children, ...rest }, forwardedRef) {
  const { item } = useTaskItemContext("TaskListItemLabel");
  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} {...rest}>
      {children ?? item.label}
    </Comp>
  );
});

/* -------------------------------------------------------------------------
 * Progress
 * ---------------------------------------------------------------------- */

export interface TaskListProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * Completion count, exposed as a progress bar.
 *
 * Announcing every individual item status change would be unusable on a long
 * plan, so the aggregate is the live region and the items themselves are not.
 */
export const TaskListProgress = React.forwardRef<
  HTMLDivElement,
  TaskListProgressProps
>(function TaskListProgress({ asChild = false, children, ...rest }, forwardedRef) {
  const { done, total } = useTaskListContext("TaskListProgress");
  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={forwardedRef}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${total} tasks done`}
      data-handoff-slot="task-progress"
      {...rest}
    >
      {children ?? `${done}/${total}`}
    </Comp>
  );
});
