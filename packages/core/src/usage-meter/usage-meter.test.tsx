import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  UsageMeter,
  UsageMeterTokens,
  UsageMeterCost,
  UsageMeterContext,
} from "./index";
import type { UsageStats } from "../types";

function Example(usage: UsageStats) {
  return (
    <UsageMeter usage={usage}>
      <UsageMeterTokens />
      <UsageMeterCost />
      <UsageMeterContext />
    </UsageMeter>
  );
}

describe("UsageMeter", () => {
  it("abbreviates token counts visually but speaks the exact numbers", () => {
    render(<Example inputTokens={12400} outputTokens={830} />);

    expect(screen.getByText("↑12k ↓830")).toBeInTheDocument();
    expect(screen.getByText("12400 tokens in, 830 tokens out")).toBeInTheDocument();
  });

  it("mentions cached tokens when the backend reports them", () => {
    render(<Example inputTokens={1000} outputTokens={10} cachedInputTokens={800} />);
    expect(
      screen.getByText("1000 tokens in, 10 tokens out, 800 cached"),
    ).toBeInTheDocument();
  });

  it("exposes context fill as a progress bar", () => {
    render(<Example inputTokens={50_000} outputTokens={50_000} contextWindow={200_000} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute(
      "aria-valuetext",
      "50% of context used, 100000 of 200000 tokens",
    );
  });

  it("flags the bar once past the warning threshold", () => {
    const { rerender } = render(
      <Example inputTokens={10} outputTokens={0} contextWindow={100} />,
    );
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("data-warn");

    rerender(<Example inputTokens={90} outputTokens={0} contextWindow={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-warn");
  });

  it("clamps the fill when usage overruns the window", () => {
    render(<Example inputTokens={300} outputTokens={0} contextWindow={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("omits the bar when no context window is known", () => {
    render(<Example inputTokens={10} outputTokens={5} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("omits cost when the backend did not report one", () => {
    const { rerender } = render(<Example inputTokens={10} />);
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();

    rerender(<Example inputTokens={10} costMicros={4500} />);
    expect(screen.getByText("$0.0045")).toBeInTheDocument();
  });
});
