import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TaskList,
  TaskListItems,
  TaskListItem,
  TaskListItemStatus,
  TaskListItemLabel,
  TaskListProgress,
} from "./index";
import type { TaskItem } from "../types";

const items: TaskItem[] = [
  { id: "1", label: "Read the config", status: "done" },
  { id: "2", label: "Patch the handler", status: "active" },
  { id: "3", label: "Run the tests", status: "pending" },
];

function Example({ list = items }: { list?: TaskItem[] }) {
  return (
    <TaskList items={list} label="Plan">
      <TaskListProgress />
      <TaskListItems>
        {list.map((item) => (
          <TaskListItem key={item.id} item={item}>
            <TaskListItemStatus />
            <TaskListItemLabel />
          </TaskListItem>
        ))}
      </TaskListItems>
    </TaskList>
  );
}

describe("TaskList", () => {
  it("names the list for screen readers", () => {
    render(<Example />);
    expect(screen.getByRole("list", { name: "Plan" })).toBeInTheDocument();
  });

  it("renders one item per task", () => {
    render(<Example />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Patch the handler")).toBeInTheDocument();
  });

  it("aggregates progress instead of announcing every item", () => {
    render(<Example />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "3");
    expect(bar).toHaveAttribute("aria-valuetext", "1 of 3 tasks done");
  });

  it("marks the active task as the current step", () => {
    render(<Example />);
    const active = screen
      .getAllByRole("listitem")
      .find((item) => item.dataset.status === "active");

    expect(active).toHaveAttribute("aria-current", "step");
  });

  it("gives each status a spoken label, not just a colour", () => {
    render(<Example />);
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
  });

  it("tracks a revised plan", () => {
    const { rerender } = render(<Example />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");

    rerender(
      <Example
        list={[
          { id: "1", label: "Read the config", status: "done" },
          { id: "2", label: "Patch the handler", status: "done" },
        ]}
      />,
    );

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "2");
  });
});
