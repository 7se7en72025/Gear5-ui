import { describe, expect, it } from "vitest";
import { parseAnsi, stripAnsi } from "./ansi";

const ESC = "\x1b";

describe("parseAnsi", () => {
  it("returns plain text untouched as a single segment", () => {
    expect(parseAnsi("hello")).toEqual([{ text: "hello" }]);
  });

  it("returns nothing for an empty string", () => {
    expect(parseAnsi("")).toEqual([]);
  });

  it("applies a basic foreground colour", () => {
    expect(parseAnsi(`${ESC}[31mred${ESC}[0m`)).toEqual([
      { text: "red", fg: "red" },
    ]);
  });

  it("keeps unstyled text before and after a styled run", () => {
    const segments = parseAnsi(`plain ${ESC}[32mgreen${ESC}[0m done`);
    expect(segments).toEqual([
      { text: "plain " },
      { text: "green", fg: "green" },
      { text: " done" },
    ]);
  });

  it("handles bright colours", () => {
    expect(parseAnsi(`${ESC}[91mhot`)).toEqual([
      { text: "hot", fg: "bright-red" },
    ]);
  });

  it("combines attributes set in one sequence", () => {
    expect(parseAnsi(`${ESC}[1;4;34mbold`)).toEqual([
      { text: "bold", bold: true, underline: true, fg: "blue" },
    ]);
  });

  it("resets only the attribute a disable code targets", () => {
    const segments = parseAnsi(`${ESC}[1;31mboth${ESC}[22mjustRed`);
    expect(segments[0]).toEqual({ text: "both", bold: true, fg: "red" });
    expect(segments[1]).toEqual({ text: "justRed", fg: "red" });
  });

  it("treats an empty parameter list as a full reset", () => {
    const segments = parseAnsi(`${ESC}[1mbold${ESC}[mplain`);
    expect(segments[1]).toEqual({ text: "plain" });
  });

  it("resolves 256-colour cube values to hex", () => {
    // 196 is the pure red corner of the 6x6x6 cube.
    expect(parseAnsi(`${ESC}[38;5;196mx`)).toEqual([
      { text: "x", fg: "#ff0000" },
    ]);
  });

  it("maps the low 256-colour range back onto the named palette", () => {
    expect(parseAnsi(`${ESC}[38;5;2mx`)).toEqual([{ text: "x", fg: "green" }]);
    expect(parseAnsi(`${ESC}[38;5;9mx`)).toEqual([
      { text: "x", fg: "bright-red" },
    ]);
  });

  it("resolves the 256-colour greyscale ramp", () => {
    expect(parseAnsi(`${ESC}[38;5;232mx`)).toEqual([
      { text: "x", fg: "#080808" },
    ]);
  });

  it("passes truecolor through as hex", () => {
    expect(parseAnsi(`${ESC}[38;2;18;52;86mx`)).toEqual([
      { text: "x", fg: "#123456" },
    ]);
  });

  it("supports background colours", () => {
    expect(parseAnsi(`${ESC}[43mx`)).toEqual([{ text: "x", bg: "yellow" }]);
  });

  it("strips cursor and erase sequences without emitting them as text", () => {
    // A progress bar redrawing itself is the classic case.
    const segments = parseAnsi(`${ESC}[2K${ESC}[1Gbuilding`);
    expect(segments).toEqual([{ text: "building" }]);
  });

  it("does not mis-colour a malformed extended sequence", () => {
    const segments = parseAnsi(`${ESC}[38;5mx`);
    expect(segments[0]?.fg).toBeUndefined();
    expect(segments[0]?.text).toBe("x");
  });

  it("parses a realistic compiler line", () => {
    const line = `${ESC}[31merror${ESC}[0m${ESC}[1m: cannot find module${ESC}[0m`;
    expect(parseAnsi(line)).toEqual([
      { text: "error", fg: "red" },
      { text: ": cannot find module", bold: true },
    ]);
  });
});

describe("stripAnsi", () => {
  it("removes every escape sequence", () => {
    expect(stripAnsi(`${ESC}[31mred${ESC}[0m and ${ESC}[2Kmore`)).toBe(
      "red and more",
    );
  });

  it("leaves clean text alone", () => {
    expect(stripAnsi("nothing to strip")).toBe("nothing to strip");
  });
});
