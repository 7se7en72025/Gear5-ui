import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningPanel,
  ReasoningLabel,
  ReasoningText,
} from "./index";
import type { ReasoningProps } from "./index";

function Example(props: Partial<ReasoningProps>) {
  return (
    <Reasoning text="Checking the config file first." {...props}>
      <ReasoningTrigger>
        <ReasoningLabel />
      </ReasoningTrigger>
      <ReasoningPanel>
        <ReasoningText />
      </ReasoningPanel>
    </Reasoning>
  );
}

describe("Reasoning", () => {
  it("labels itself by state", () => {
    const { rerender } = render(<Example streaming />);
    expect(screen.getByText("Thinking…")).toBeInTheDocument();

    rerender(<Example startedAt={0} endedAt={4200} />);
    expect(screen.getByText("Thought for 4.2s")).toBeInTheDocument();
  });

  it("falls back to a plain label without timing information", () => {
    render(<Example />);
    expect(screen.getByText("Reasoning")).toBeInTheDocument();
  });

  it("wires the disclosure for screen readers", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);

    const panel = screen.getByRole("region");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    expect(screen.getByText("Checking the config file first.")).toBeInTheDocument();
  });

  it("announces streaming text and stops once settled", () => {
    const { rerender } = render(<Example streaming defaultOpen />);

    const body = screen.getByText("Checking the config file first.");
    expect(body).toHaveAttribute("aria-live", "polite");
    expect(body).toHaveAttribute("aria-busy", "true");

    rerender(<Example streaming={false} defaultOpen />);
    expect(body).toHaveAttribute("aria-live", "off");
    expect(body).not.toHaveAttribute("aria-busy");
  });

  it("autoCollapse opens while streaming and folds away when finished", () => {
    const { rerender } = render(<Example streaming autoCollapse />);
    expect(screen.getByRole("region")).toBeInTheDocument();

    rerender(<Example streaming={false} autoCollapse />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("autoCollapse never overrides an explicit user choice", async () => {
    const { rerender } = render(<Example streaming autoCollapse />);

    // User pins it open mid-stream, then closes and reopens it.
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("region")).toBeInTheDocument();

    rerender(<Example streaming={false} autoCollapse />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("keeps the panel mounted but hidden with forceMount", () => {
    render(
      <Reasoning text="hidden body">
        <ReasoningTrigger>
          <ReasoningLabel />
        </ReasoningTrigger>
        <ReasoningPanel forceMount>
          <ReasoningText />
        </ReasoningPanel>
      </Reasoning>,
    );

    const panel = screen.getByText("hidden body").closest("[hidden]");
    expect(panel).toBeInTheDocument();
  });
});
