import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Composer,
  ComposerCount,
  ComposerHint,
  ComposerInput,
  ComposerSubmit,
  ComposerToolbar,
} from "./index";
import type { ComposerProps } from "./index";

function Example({ max, ...props }: Partial<ComposerProps> & { max?: number }) {
  return (
    <Composer {...props}>
      <ComposerInput placeholder="Ask the agent" />
      <ComposerToolbar>
        <ComposerHint />
        <ComposerCount max={max} />
        <ComposerSubmit />
      </ComposerToolbar>
    </Composer>
  );
}

describe("Composer", () => {
  it("describes the input with the keyboard hint", () => {
    render(<Example />);
    const input = screen.getByPlaceholderText("Ask the agent");
    const hint = screen.getByText(/Enter to send/);
    expect(input).toHaveAttribute("aria-describedby", hint.id);
  });

  it("submits the trimmed value on Enter", async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText("Ask the agent"), "  hi  ");
    await userEvent.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("hi");
  });

  it("inserts a newline on Shift+Enter instead of submitting", async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Ask the agent");
    await userEvent.type(input, "one{Shift>}{Enter}{/Shift}two");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveValue("one\ntwo");
  });

  it("does not submit while an IME composition is active", async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} defaultValue="にほんご" />);

    const input = screen.getByPlaceholderText("Ask the agent");
    input.focus();

    // The Enter that commits a Japanese composition must not send the message.
    await userEvent.keyboard("{Enter}", {
      // userEvent cannot model composition, so drive the events directly.
      skipClick: true,
    });
    onSubmit.mockClear();

    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    const enter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(enter);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("refuses to submit an empty or whitespace-only draft", async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} defaultValue="   " />);

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    await userEvent.type(screen.getByPlaceholderText("Ask the agent"), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("swaps send for stop while busy", async () => {
    const onStop = vi.fn();
    const onSubmit = vi.fn();
    render(<Example busy onStop={onStop} onSubmit={onSubmit} defaultValue="hello" />);

    const button = screen.getByRole("button", { name: "Stop" });
    // Must not be a submit button, or stopping would also send the draft.
    expect(button).toHaveAttribute("type", "button");

    await userEvent.click(button);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit while busy", async () => {
    const onSubmit = vi.fn();
    render(<Example busy onSubmit={onSubmit} defaultValue="hello" />);

    await userEvent.type(screen.getByPlaceholderText("Ask the agent"), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("works as a controlled input", async () => {
    const onValueChange = vi.fn();
    render(<Example value="fixed" onValueChange={onValueChange} />);

    const input = screen.getByPlaceholderText("Ask the agent");
    await userEvent.type(input, "x");

    expect(onValueChange).toHaveBeenCalled();
    expect(input).toHaveValue("fixed");
  });

  it("shows the counter only as the limit approaches", () => {
    // Mounted separately, not rerendered: `defaultValue` seeds uncontrolled
    // state once, so changing it on a live component does nothing.
    const { unmount } = render(<Example max={10} defaultValue="ab" />);
    expect(screen.queryByText("2/10")).not.toBeInTheDocument();
    unmount();

    render(<Example max={10} defaultValue="abcdefghi" />);
    expect(screen.getByText("9/10")).toBeInTheDocument();
    expect(screen.getByText("1 characters remaining")).toBeInTheDocument();
  });

  it("flags an over-limit draft", () => {
    render(<Example max={5} defaultValue="abcdefgh" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-over");
    expect(screen.getByText("3 characters over the limit")).toBeInTheDocument();
  });
});
