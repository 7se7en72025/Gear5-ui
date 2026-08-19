import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  LogStream,
  LogStreamFollowButton,
  LogStreamLines,
  LogStreamViewport,
} from "./index";
import type { LogLine } from "../types";

const ESC = "\x1b";

const lines: LogLine[] = [
  { id: "1", text: "installing dependencies" },
  { id: "2", text: `${ESC}[32m✓${ESC}[0m done in 2.1s` },
  { id: "3", text: "cannot find module 'foo'", stream: "stderr" },
];

function Example(props: { streaming?: boolean; announce?: boolean }) {
  return (
    <LogStream lines={lines} label="Build output" {...props}>
      <LogStreamViewport>
        <LogStreamLines />
      </LogStreamViewport>
      <LogStreamFollowButton />
    </LogStream>
  );
}

describe("LogStream", () => {
  it("exposes the viewport as a named, reachable log region", () => {
    render(<Example />);

    const viewport = screen.getByRole("log", { name: "Build output" });
    // A scrollable region no keyboard user can reach is a WCAG failure.
    expect(viewport).toHaveAttribute("tabindex", "0");
  });

  it("stays silent by default so a noisy build cannot flood the user", () => {
    render(<Example streaming />);
    expect(screen.getByRole("log")).toHaveAttribute("aria-live", "off");
  });

  it("announces politely when asked to", () => {
    render(<Example announce />);
    expect(screen.getByRole("log")).toHaveAttribute("aria-live", "polite");
  });

  it("marks the region busy while output is still arriving", () => {
    const { rerender } = render(<Example streaming />);
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true");

    rerender(<Example streaming={false} />);
    expect(screen.getByRole("log")).not.toHaveAttribute("aria-busy");
  });

  it("renders every line", () => {
    render(<Example />);
    expect(screen.getByText("installing dependencies")).toBeInTheDocument();
    expect(screen.getByText("cannot find module 'foo'")).toBeInTheDocument();
  });

  it("strips escape codes and colours the text instead", () => {
    render(<Example />);

    // The raw sequence must never reach the DOM as visible text.
    expect(screen.queryByText(/\[32m/)).not.toBeInTheDocument();

    const check = screen.getByText("✓");
    expect(check).toHaveAttribute("data-fg", "green");

    // The rest of the line keeps its leading space, which the default text
    // matcher would normalise away.
    const line = check.closest("[data-handoff-slot='log-line']");
    expect(line?.textContent).toBe("✓ done in 2.1s");
  });

  it("distinguishes stderr for screen readers, not just by colour", () => {
    render(<Example />);
    expect(screen.getByText("Error output:")).toBeInTheDocument();

    const errorLine = screen.getByText("cannot find module 'foo'").closest("div");
    expect(errorLine).toHaveAttribute("data-stream", "stderr");
  });

  it("hides the follow button while the view is already following", () => {
    render(<Example streaming />);
    expect(
      screen.queryByRole("button", { name: "Jump to latest" }),
    ).not.toBeInTheDocument();
  });

  it("hands rendering over via renderLine", () => {
    render(
      <LogStream lines={lines}>
        <LogStreamViewport>
          <LogStreamLines
            renderLine={(line, segments) => (
              <p key={line.id}>{segments.map((s) => s.text).join("")}</p>
            )}
          />
        </LogStreamViewport>
      </LogStream>,
    );

    expect(screen.getByText("✓ done in 2.1s")).toBeInTheDocument();
  });
});
