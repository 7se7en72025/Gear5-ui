/**
 * Minimal ANSI SGR parser for terminal output.
 *
 * Agents shell out constantly, and raw `\x1b[32m` sequences rendered as text
 * are worse than useless. This turns a line into styled segments and drops the
 * escape codes that have no visual meaning in a scrollback view.
 */

export interface AnsiSegment {
  text: string;
  /**
   * One of the 16 basic colour names (`red`, `bright-red`, …) so themes can map
   * them, or a `#rrggbb` string for 256-colour and truecolor, which are exact
   * by definition and pass straight through.
   */
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

const BASIC = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
] as const;

/** The xterm 256-colour cube, needed to resolve `38;5;n` to a real colour. */
function xterm256(index: number): string {
  if (index < 8) return BASIC[index] as string;
  if (index < 16) return `bright-${BASIC[index - 8]}`;

  if (index < 232) {
    // 6×6×6 colour cube starting at index 16.
    const n = index - 16;
    const steps = [0, 95, 135, 175, 215, 255];
    const r = steps[Math.floor(n / 36) % 6] as number;
    const g = steps[Math.floor(n / 6) % 6] as number;
    const b = steps[n % 6] as number;
    return rgbToHex(r, g, b);
  }

  // 24 greys from index 232.
  const level = 8 + (index - 232) * 10;
  return rgbToHex(level, level, level);
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}

type Style = Omit<AnsiSegment, "text">;

/**
 * Apply one SGR parameter run to the running style.
 * Returns the index to continue from, since 38/48 consume extra parameters.
 */
function applyCode(style: Style, codes: number[], i: number): number {
  const code = codes[i] as number;

  if (code === 0) {
    for (const key of Object.keys(style)) delete style[key as keyof Style];
    return i + 1;
  }
  if (code === 1) style.bold = true;
  else if (code === 2) style.dim = true;
  else if (code === 3) style.italic = true;
  else if (code === 4) style.underline = true;
  else if (code === 9) style.strike = true;
  else if (code === 22) {
    delete style.bold;
    delete style.dim;
  } else if (code === 23) delete style.italic;
  else if (code === 24) delete style.underline;
  else if (code === 29) delete style.strike;
  else if (code >= 30 && code <= 37) style.fg = BASIC[code - 30];
  else if (code === 39) delete style.fg;
  else if (code >= 40 && code <= 47) style.bg = BASIC[code - 40];
  else if (code === 49) delete style.bg;
  else if (code >= 90 && code <= 97) style.fg = `bright-${BASIC[code - 90]}`;
  else if (code >= 100 && code <= 107) style.bg = `bright-${BASIC[code - 100]}`;
  else if (code === 38 || code === 48) {
    const target = code === 38 ? "fg" : "bg";
    const mode = codes[i + 1];

    if (mode === 5 && codes[i + 2] !== undefined) {
      style[target] = xterm256(codes[i + 2] as number);
      return i + 3;
    }
    if (mode === 2 && codes[i + 4] !== undefined) {
      style[target] = rgbToHex(
        codes[i + 2] as number,
        codes[i + 3] as number,
        codes[i + 4] as number,
      );
      return i + 5;
    }
    // Malformed sequence — skip the introducer rather than mis-colouring.
    return i + 2;
  }

  return i + 1;
}

// SGR sequences carry style; every other CSI sequence (cursor moves, erases)
// is meaningless in a scrollback view and is stripped.
const ANSI_PATTERN = /\x1b\[([0-9;]*)([A-Za-z])/g;

/** Split a string containing ANSI escapes into styled segments. */
export function parseAnsi(input: string): AnsiSegment[] {
  if (!input) return [];
  if (!input.includes("\x1b")) return [{ text: input }];

  const segments: AnsiSegment[] = [];
  const style: Style = {};
  let lastIndex = 0;

  const push = (text: string) => {
    if (text) segments.push({ text, ...style });
  };

  ANSI_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANSI_PATTERN.exec(input)) !== null) {
    push(input.slice(lastIndex, match.index));
    lastIndex = match.index + match[0].length;

    if (match[2] !== "m") continue;

    // An empty parameter list means reset, same as `0`.
    const codes = (match[1] ?? "")
      .split(";")
      .map((part) => (part === "" ? 0 : Number.parseInt(part, 10)))
      .filter((n) => !Number.isNaN(n));

    let i = 0;
    while (i < codes.length) i = applyCode(style, codes, i);
  }

  push(input.slice(lastIndex));
  return segments;
}

/** Drop every escape sequence, for copy-to-clipboard and accessible text. */
export function stripAnsi(input: string): string {
  return input.replace(ANSI_PATTERN, "");
}
