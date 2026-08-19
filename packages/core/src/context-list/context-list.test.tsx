import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ContextEntries,
  ContextEntry,
  ContextEntryName,
  ContextEntryRemove,
  ContextEntryTokens,
  ContextList,
  ContextSummary,
} from "./index";
import type { ContextItem } from "../types";
import {
  AgentHandoff,
  AgentHandoffArrow,
  AgentHandoffFrom,
  AgentHandoffReason,
  AgentHandoffTo,
} from "../agent-handoff";

const ITEMS: ContextItem[] = [
  { id: "1", name: "src/retry.ts", kind: "file", tokens: 1_200 },
  { id: "2", name: "README.md", kind: "file", tokens: 3_400, pinned: true },
  { id: "3", name: "https://example.com/rfc", kind: "url" },
];

function Example(props: {
  items?: ContextItem[];
  budget?: number;
  onRemove?: (item: ContextItem) => void;
}) {
  const items = props.items ?? ITEMS;
  return (
    <ContextList items={items} budget={props.budget} onRemove={props.onRemove}>
      <ContextSummary />
      <ContextEntries>
        {items.map((item) => (
          <ContextEntry key={item.id} item={item}>
            <ContextEntryName />
            <ContextEntryTokens />
            <ContextEntryRemove />
          </ContextEntry>
        ))}
      </ContextEntries>
    </ContextList>
  );
}

describe("ContextList", () => {
  it("names the list and renders one row per item", () => {
    render(<Example />);
    expect(screen.getByRole("list", { name: "Context" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("totals the tokens and speaks the exact number", () => {
    render(<Example />);
    expect(screen.getByText("3 items, 4.6k")).toBeInTheDocument();
    expect(screen.getByText(/3 items in context, 4600 tokens\./)).toBeInTheDocument();
  });

  it("exposes the budget as a progressbar", () => {
    render(<Example budget={10_000} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "46");
    expect(bar).toHaveAttribute(
      "aria-valuetext",
      "46% of the context budget used, 4600 of 10000 tokens",
    );
  });

  it("has no progressbar when no budget was given", () => {
    render(<Example />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("warns when the budget is blown, and says what happens next", () => {
    render(<Example budget={1_000} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-over-budget");
    // Clamped, since a bar cannot be more than full.
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(
      screen.getByText(/Over budget, the oldest items will be dropped\./),
    ).toBeInTheDocument();
  });

  it("marks pinned items for screen readers, not just visually", () => {
    render(<Example />);
    expect(screen.getByText("(pinned)")).toBeInTheDocument();
  });

  it("omits the token count for an item nobody measured", () => {
    const { container } = render(<Example />);
    const rows = container.querySelectorAll('[data-handoff-part="context-entry"]');
    const urlRow = rows[2] as HTMLElement;
    expect(urlRow.querySelector('[data-handoff-slot="entry-tokens"]')).toBeNull();
  });

  it("names each remove button against its item", async () => {
    const onRemove = vi.fn();
    render(<Example onRemove={onRemove} />);

    await userEvent.click(screen.getByRole("button", { name: "Remove src/retry.ts" }));
    expect(onRemove).toHaveBeenCalledWith(ITEMS[0]);
  });
});

describe("AgentHandoff", () => {
  it("reads as one sentence rather than three fragments", () => {
    render(
      <AgentHandoff from="researcher" to="writer" reason="Research complete">
        <AgentHandoffFrom />
        <AgentHandoffArrow />
        <AgentHandoffTo />
        <AgentHandoffReason />
      </AgentHandoff>,
    );

    expect(
      screen.getByText("researcher handed off to writer. Research complete."),
    ).toBeInTheDocument();
  });

  it("hides the visible fragments, since the sentence already covers them", () => {
    const { container } = render(
      <AgentHandoff from="a" to="b" announce={false}>
        <AgentHandoffFrom />
        <AgentHandoffArrow />
        <AgentHandoffTo />
      </AgentHandoff>,
    );

    const visible = container.querySelectorAll('[aria-hidden="true"]');
    expect(visible).toHaveLength(3);
  });

  it("announces the transfer as it happens", () => {
    render(<AgentHandoff from="planner" to="coder" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "coder is taking over from planner.",
    );
  });

  it("can be silenced", () => {
    render(<AgentHandoff from="planner" to="coder" announce={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("drops the reason element when there is no reason", () => {
    const { container } = render(
      <AgentHandoff from="a" to="b" announce={false}>
        <AgentHandoffReason />
      </AgentHandoff>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });
});
