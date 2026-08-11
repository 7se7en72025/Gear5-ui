export type DiffLineType = "add" | "remove" | "context";

export interface DiffLine {
  type: DiffLineType;
  content: string;
  /** 1-indexed line number in the original. Absent on added lines. */
  beforeLine?: number;
  /** 1-indexed line number in the result. Absent on removed lines. */
  afterLine?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  /**
   * True when the inputs were too large to diff precisely and the changed
   * region was emitted as a wholesale replacement instead.
   */
  approximate: boolean;
}

/**
 * Cap on the LCS table. The algorithm is O(n × m) in both time and memory, and
 * an agent rewriting a large file would otherwise lock the main thread for
 * seconds. Past this we degrade to a block replacement, which is still correct
 * — just less granular.
 */
const MAX_TABLE_CELLS = 4_000_000;

function splitLines(text: string): string[] {
  if (text === "") return [];
  return text.split("\n");
}

/**
 * Line diff between two texts.
 *
 * Common prefixes and suffixes are trimmed before the expensive part, which is
 * what makes streaming cheap: an agent appending to the end of a file leaves
 * the entire head as an untouched prefix.
 */
export function diffLines(before: string, after: string): DiffResult {
  const a = splitLines(before);
  const b = splitLines(after);

  // Trim the common head.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    start++;
  }

  // Trim the common tail, without overlapping the head.
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;

  for (let i = 0; i < start; i++) {
    lines.push({
      type: "context",
      content: a[i] as string,
      beforeLine: i + 1,
      afterLine: i + 1,
    });
  }

  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  const approximate = (midA.length + 1) * (midB.length + 1) > MAX_TABLE_CELLS;

  const pushRemove = (content: string, beforeIndex: number) => {
    lines.push({ type: "remove", content, beforeLine: beforeIndex + 1 });
    deletions++;
  };
  const pushAdd = (content: string, afterIndex: number) => {
    lines.push({ type: "add", content, afterLine: afterIndex + 1 });
    additions++;
  };

  if (approximate) {
    midA.forEach((line, i) => pushRemove(line, start + i));
    midB.forEach((line, i) => pushAdd(line, start + i));
  } else {
    const m = midA.length;
    const n = midB.length;
    const width = n + 1;
    const table = new Uint32Array((m + 1) * width);

    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        table[i * width + j] =
          midA[i] === midB[j]
            ? (table[(i + 1) * width + (j + 1)] as number) + 1
            : Math.max(
                table[(i + 1) * width + j] as number,
                table[i * width + (j + 1)] as number,
              );
      }
    }

    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (midA[i] === midB[j]) {
        lines.push({
          type: "context",
          content: midA[i] as string,
          beforeLine: start + i + 1,
          afterLine: start + j + 1,
        });
        i++;
        j++;
      } else if (
        (table[(i + 1) * width + j] as number) >=
        (table[i * width + (j + 1)] as number)
      ) {
        pushRemove(midA[i] as string, start + i);
        i++;
      } else {
        pushAdd(midB[j] as string, start + j);
        j++;
      }
    }
    while (i < m) {
      pushRemove(midA[i] as string, start + i);
      i++;
    }
    while (j < n) {
      pushAdd(midB[j] as string, start + j);
      j++;
    }
  }

  // The trimmed tail keeps its real line numbers, which differ between the two
  // sides whenever the change added or removed lines.
  const tailLength = a.length - endA;
  for (let k = 0; k < tailLength; k++) {
    lines.push({
      type: "context",
      content: a[endA + k] as string,
      beforeLine: endA + k + 1,
      afterLine: endB + k + 1,
    });
  }

  return { lines, additions, deletions, approximate };
}
