import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuggestionItem, Suggestions } from "./index";
import type { Suggestion } from "./index";
import { RunError, RunErrorDetails, RunErrorMessage, RunErrorRetry, RunErrorTitle } from "../run-error";
import { StreamingText, StreamingTextBody, StreamingTextCaret } from "../streaming-text";

const ITEMS: Suggestion[] = [
  { id: "a", label: "Explain the failure" },
  { id: "b", label: "Write a test" },
  { id: "c", label: "Roll it back", value: "Roll back the deploy" },
];

function SuggestionsExample({
  onSelect,
  items = ITEMS,
}: {
  onSelect?: (value: string) => void;
  items?: Suggestion[];
}) {
  return (
    <Suggestions items={items} onSelect={onSelect} label="Try one of these">
      {items.map((item, index) => (
        <SuggestionItem key={item.id} item={item} index={index} />
      ))}
    </Suggestions>
  );
}

describe("Suggestions", () => {
  it("is a labelled toolbar", () => {
    render(<SuggestionsExample />);
    expect(
      screen.getByRole("toolbar", { name: "Try one of these" }),
    ).toBeInTheDocument();
  });

  it("costs one tab stop no matter how many items there are", async () => {
    render(<SuggestionsExample />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("tabindex", "0");
    expect(buttons[1]).toHaveAttribute("tabindex", "-1");
    expect(buttons[2]).toHaveAttribute("tabindex", "-1");

    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();
  });

  it("moves focus with the arrow keys", async () => {
    render(<SuggestionsExample />);
    const buttons = screen.getAllByRole("button");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(buttons[1]).toHaveFocus();
    expect(buttons[1]).toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("{ArrowLeft}");
    expect(buttons[0]).toHaveFocus();
  });

  it("wraps around at both ends", async () => {
    render(<SuggestionsExample />);
    const buttons = screen.getAllByRole("button");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    expect(buttons[2]).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(buttons[0]).toHaveFocus();
  });

  it("jumps to the ends with Home and End", async () => {
    render(<SuggestionsExample />);
    const buttons = screen.getAllByRole("button");

    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(buttons[2]).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(buttons[0]).toHaveFocus();
  });

  it("sends the value, falling back to the label", async () => {
    const onSelect = vi.fn();
    render(<SuggestionsExample onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "Explain the failure" }));
    expect(onSelect).toHaveBeenCalledWith("Explain the failure", ITEMS[0]);

    await userEvent.click(screen.getByRole("button", { name: "Roll it back" }));
    expect(onSelect).toHaveBeenCalledWith("Roll back the deploy", ITEMS[2]);
  });

  it("keeps the roving index on a shrinking list", () => {
    const { rerender } = render(<SuggestionsExample />);
    rerender(<SuggestionsExample items={[ITEMS[0] as Suggestion]} />);

    // The old active index pointed past the end. Nothing should be orphaned.
    expect(screen.getAllByRole("button")[0]).toHaveAttribute("tabindex", "0");
  });
});

describe("RunError", () => {
  it("announces itself as an alert", () => {
    render(
      <RunError title="The run stopped" message="Timed out after 60 seconds.">
        <RunErrorTitle />
        <RunErrorMessage />
      </RunError>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("The run stopped").id,
    );
    expect(screen.getByText("Timed out after 60 seconds.")).toBeInTheDocument();
  });

  it("keeps the stack trace collapsed so it is not read first", async () => {
    render(
      <RunError title="Failed" details="at retry (src/retry.ts:12)">
        <RunErrorTitle />
        <RunErrorDetails />
      </RunError>,
    );

    expect(screen.queryByText(/src\/retry\.ts:12/)).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Show details" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);
    expect(screen.getByText(/src\/retry\.ts:12/)).toBeInTheDocument();
  });

  it("retries, and locks the button while one is running", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <RunError title="Failed" onRetry={onRetry}>
        <RunErrorRetry />
      </RunError>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(
      <RunError title="Failed" onRetry={onRetry} retrying>
        <RunErrorRetry />
      </RunError>,
    );

    const button = screen.getByRole("button", { name: "Retrying" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("omits retry entirely when there is no handler", () => {
    render(
      <RunError title="Failed">
        <RunErrorTitle />
        <RunErrorRetry />
      </RunError>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("StreamingText", () => {
  function Example({ text, streaming }: { text: string; streaming: boolean }) {
    return (
      <StreamingText text={text} streaming={streaming}>
        <StreamingTextBody />
        <StreamingTextCaret />
      </StreamingText>
    );
  }

  it("announces one completed sentence at a time, not the whole buffer", () => {
    const { container, rerender } = render(
      <Example text="The deploy failed" streaming />,
    );
    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;

    // No sentence has ended yet, so nothing is spoken.
    expect(live).toHaveTextContent("");

    rerender(<Example text="The deploy failed. Rolling back now" streaming />);
    expect(live).toHaveTextContent("The deploy failed.");

    // The second sentence replaces the first rather than re-reading both.
    rerender(
      <Example text="The deploy failed. Rolling back now. Done." streaming />,
    );
    expect(live).toHaveTextContent("Rolling back now. Done.");
  });

  it("flushes a trailing fragment once the stream ends", () => {
    const { container, rerender } = render(
      <Example text="All good. No further action" streaming />,
    );
    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live).toHaveTextContent("All good.");

    rerender(<Example text="All good. No further action" streaming={false} />);
    expect(live).toHaveTextContent("No further action");
  });

  it("hides the visible copy from assistive tech only while streaming", () => {
    const { container, rerender } = render(<Example text="Hello there." streaming />);
    const body = container.querySelector('[data-handoff-slot="streaming-body"]');

    expect(body).toHaveAttribute("aria-hidden", "true");
    rerender(<Example text="Hello there." streaming={false} />);
    expect(body).not.toHaveAttribute("aria-hidden");
  });

  it("shows a decorative caret only while streaming", () => {
    const { container, rerender } = render(<Example text="Working" streaming />);
    const caret = container.querySelector('[data-handoff-slot="caret"]');

    expect(caret).toBeInTheDocument();
    expect(caret).toHaveAttribute("aria-hidden", "true");

    rerender(<Example text="Working" streaming={false} />);
    expect(container.querySelector('[data-handoff-slot="caret"]')).toBeNull();
  });
});
