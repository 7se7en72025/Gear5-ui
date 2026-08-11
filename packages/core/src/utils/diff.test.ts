import { describe, expect, it } from "vitest";
import { diffLines } from "./diff";

/** Compact view of a diff, for readable assertions. */
function summarize(before: string, after: string) {
  const result = diffLines(before, after);
  return {
    ...result,
    rendered: result.lines.map(
      (line) =>
        `${line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}${line.content}`,
    ),
  };
}

describe("diffLines", () => {
  it("reports no changes for identical input", () => {
    const result = summarize("a\nb\nc", "a\nb\nc");
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
    expect(result.rendered).toEqual([" a", " b", " c"]);
  });

  it("handles a pure append", () => {
    const result = summarize("a\nb", "a\nb\nc");
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(0);
    expect(result.rendered).toEqual([" a", " b", "+c"]);
  });

  it("handles a pure deletion", () => {
    const result = summarize("a\nb\nc", "a\nc");
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(1);
    expect(result.rendered).toEqual([" a", "-b", " c"]);
  });

  it("handles a replacement in the middle", () => {
    const result = summarize("a\nb\nc", "a\nx\nc");
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(1);
    expect(result.rendered).toEqual([" a", "-b", "+x", " c"]);
  });

  it("treats an empty original as a new file", () => {
    const result = summarize("", "a\nb");
    expect(result.deletions).toBe(0);
    expect(result.additions).toBe(2);
    expect(result.rendered).toEqual(["+a", "+b"]);
  });

  it("treats an empty result as a deleted file", () => {
    const result = summarize("a\nb", "");
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(2);
    expect(result.rendered).toEqual(["-a", "-b"]);
  });

  it("keeps a shared prefix and suffix out of the changed region", () => {
    const result = summarize("h\na\nb\nt", "h\nx\nt");
    expect(result.rendered).toEqual([" h", "-a", "-b", "+x", " t"]);
  });

  it("numbers lines against the correct side", () => {
    // One line removed, so the shared tail sits at different numbers on each side.
    const { lines } = diffLines("a\nb\nc", "a\nc");

    const removed = lines.find((line) => line.type === "remove");
    expect(removed).toMatchObject({ content: "b", beforeLine: 2 });
    expect(removed?.afterLine).toBeUndefined();

    const tail = lines.at(-1);
    expect(tail).toMatchObject({ content: "c", beforeLine: 3, afterLine: 2 });
  });

  it("gives added lines no original line number", () => {
    const { lines } = diffLines("a", "a\nb");
    const added = lines.find((line) => line.type === "add");
    expect(added).toMatchObject({ content: "b", afterLine: 2 });
    expect(added?.beforeLine).toBeUndefined();
  });

  it("preserves blank lines rather than collapsing them", () => {
    const result = summarize("a\n\nb", "a\n\nb\n");
    expect(result.additions).toBe(1);
    expect(result.rendered).toEqual([" a", " ", " b", "+"]);
  });

  it("diffs a realistic edit without drifting", () => {
    const before = ["import a from 'a';", "", "function run() {", "  return 1;", "}"].join("\n");
    const after = ["import a from 'a';", "", "function run() {", "  return 2;", "}"].join("\n");

    const result = summarize(before, after);
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(1);
    expect(result.approximate).toBe(false);
    expect(result.rendered).toContain("-  return 1;");
    expect(result.rendered).toContain("+  return 2;");
  });

  it("stays fast on a large file by trimming the unchanged head", () => {
    // 20k identical lines would blow the LCS budget if the trim did not run.
    const head = Array.from({ length: 20_000 }, (_, i) => `line ${i}`).join("\n");
    const start = performance.now();
    const result = diffLines(head, `${head}\nnew tail`);
    const elapsed = performance.now() - start;

    expect(result.additions).toBe(1);
    expect(result.approximate).toBe(false);
    expect(elapsed).toBeLessThan(500);
  });
});
