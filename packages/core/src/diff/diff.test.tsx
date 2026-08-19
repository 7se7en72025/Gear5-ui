import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Diff, DiffHeader, DiffPath, DiffStat, DiffBody } from "./index";
import type { DiffProps } from "./index";

function Example(props: Partial<DiffProps>) {
  return (
    <Diff path="src/index.ts" before={"a\nb\nc"} after={"a\nx\nc"} {...props}>
      <DiffHeader>
        <DiffPath />
        <DiffStat />
      </DiffHeader>
      <DiffBody />
    </Diff>
  );
}

describe("Diff", () => {
  it("names the diff by its path", () => {
    render(<Example before={"a\nb"} after={"a\nc"} />);

    const path = screen.getByText("src/index.ts");
    expect(screen.getByRole("list")).toHaveAttribute("aria-labelledby", path.id);
  });

  it("renders lines as an ordered list", () => {
    render(<Example before={"a\nb\nc"} after={"a\nx\nc"} />);
    // context a, remove b, add x, context c
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("spells out the stat instead of relying on +/− punctuation", () => {
    render(<Example before={"a\nb\nc"} after={"a\nx\nc"} />);
    expect(screen.getByText("1 addition, 1 deletion")).toBeInTheDocument();
  });

  it("pluralises the spoken stat", () => {
    render(<Example before={"a"} after={"a\nb\nc"} />);
    expect(screen.getByText("2 additions, 0 deletions")).toBeInTheDocument();
  });

  it("prefixes changed lines so their type is spoken", () => {
    render(<Example before={"a\nb\nc"} after={"a\nx\nc"} />);

    const items = screen.getAllByRole("listitem");
    const removed = items.find((item) => item.dataset.type === "remove");
    const added = items.find((item) => item.dataset.type === "add");
    const context = items.find((item) => item.dataset.type === "context");

    expect(within(removed as HTMLElement).getByText("Removed")).toBeInTheDocument();
    expect(within(added as HTMLElement).getByText("Added")).toBeInTheDocument();
    // Unchanged lines get no prefix — it would be noise on every line.
    expect(context?.textContent).toBe("a");
  });

  it("exposes line numbers for the gutter", () => {
    render(<Example before={"a\nb\nc"} after={"a\nc"} />);

    const removed = screen
      .getAllByRole("listitem")
      .find((item) => item.dataset.type === "remove");

    expect(removed).toHaveAttribute("data-before-line", "2");
    expect(removed).not.toHaveAttribute("data-after-line");
  });

  it("marks the list busy while the result is still streaming", () => {
    const { rerender } = render(<Example streaming />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");

    rerender(<Example streaming={false} />);
    expect(screen.getByRole("list")).not.toHaveAttribute("aria-busy");
  });

  it("collapses distant unchanged lines when contextLines is set", () => {
    const before = ["1", "2", "3", "4", "5", "6", "7"].join("\n");
    const after = ["1", "2", "3", "X", "5", "6", "7"].join("\n");

    render(
      <Diff path="f.ts" before={before} after={after}>
        <DiffBody contextLines={1} />
      </Diff>,
    );

    // remove 4, add X, plus one context line either side.
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hands rendering over via renderLine", () => {
    render(
      <Diff path="f.ts" before={"a"} after={"b"}>
        <DiffBody
          renderLine={(line, index) => (
            <li key={index} data-custom={line.type}>
              {line.type}:{line.content}
            </li>
          )}
        />
      </Diff>,
    );

    expect(screen.getByText("remove:a")).toBeInTheDocument();
    expect(screen.getByText("add:b")).toBeInTheDocument();
  });
});
