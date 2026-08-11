import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ToolCall,
  ToolCallTrigger,
  ToolCallPanel,
  ToolCallName,
  ToolCallStatusText,
  ToolCallInput,
  ToolCallOutput,
} from "./index";
import type { ToolCallProps } from "./index";

function Example(props: Partial<ToolCallProps>) {
  return (
    <ToolCall name="read_file" status="success" {...props}>
      <ToolCallTrigger>
        <ToolCallName />
        <ToolCallStatusText />
      </ToolCallTrigger>
      <ToolCallPanel>
        <ToolCallInput />
        <ToolCallOutput />
      </ToolCallPanel>
    </ToolCall>
  );
}

describe("ToolCall", () => {
  it("renders the tool name and status label", () => {
    render(<Example />);
    expect(screen.getByText("read_file")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("starts collapsed and wires aria-expanded / aria-controls", async () => {
    render(<Example input={{ path: "a.ts" }} />);

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByRole("region");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("toggles with Enter and Space", async () => {
    render(<Example input={{ path: "a.ts" }} />);
    const trigger = screen.getByRole("button");

    await userEvent.tab();
    expect(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders a real submit-safe button", () => {
    render(<Example />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    render(<Example open={false} onOpenChange={onOpenChange} input={{ a: 1 }} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Still closed: the parent owns the value and did not change it.
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("does not expand when disabled", async () => {
    render(<Example disabled input={{ a: 1 }} />);
    const trigger = screen.getByRole("button");

    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("renders partial input without throwing while arguments stream", () => {
    render(<Example status="pending" input={{ path: "a" }} defaultOpen />);
    expect(screen.getByText(/"path"/)).toBeInTheDocument();
  });

  it("shows the error message instead of output when the call fails", () => {
    render(<Example status="error" error="ENOENT: no such file" defaultOpen />);
    expect(screen.getByText("ENOENT: no such file")).toBeInTheDocument();
  });

  it("announces terminal transitions politely", () => {
    const { rerender } = render(<Example status="running" startedAt={0} />);

    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveTextContent("");

    rerender(<Example status="success" startedAt={0} endedAt={1200} />);
    expect(liveRegion).toHaveTextContent("Tool read_file finished in 1.2s.");
  });

  it("exposes status and state as data attributes for styling", () => {
    const { container } = render(<Example status="running" />);
    const root = container.querySelector('[data-handoff-part="tool-call"]');
    expect(root).toHaveAttribute("data-status", "running");
    expect(root).toHaveAttribute("data-state", "closed");
  });

  it("renders into the caller's element with asChild", () => {
    render(
      <ToolCall name="grep" status="success">
        <ToolCallTrigger asChild>
          <a href="#trace">
            <ToolCallName />
          </a>
        </ToolCallTrigger>
      </ToolCall>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-expanded", "false");
    expect(link).toHaveTextContent("grep");
  });

  it("throws a helpful error when a part is used outside the root", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ToolCallName />)).toThrow(
      /`ToolCallName` must be rendered inside `ToolCall`/,
    );
    spy.mockRestore();
  });
});
