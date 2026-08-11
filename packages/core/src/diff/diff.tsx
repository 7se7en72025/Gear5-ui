import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";
import { diffLines } from "../utils/diff";
import type { DiffLine, DiffResult } from "../utils/diff";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface DiffContextValue {
  path: string;
  result: DiffResult;
  streaming: boolean;
  labelId: string;
}

const [DiffProvider, useDiffContext] = createContext<DiffContextValue>("Diff");

/** Read the computed diff — for building a custom renderer. */
export function useDiff(): DiffContextValue {
  return useDiffContext("useDiff");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface DiffProps extends React.HTMLAttributes<HTMLDivElement> {
  /** File path, used as the diff's accessible name. */
  path: string;
  /** Content before the change. Omit for a newly created file. */
  before?: string;
  /** Content after the change. Omit for a deleted file. */
  after?: string;
  /** True while `after` is still arriving. */
  streaming?: boolean;
  asChild?: boolean;
}

/**
 * A line diff of a file the agent changed.
 *
 * ```tsx
 * <Diff path="src/index.ts" before={before} after={after} streaming={isStreaming}>
 *   <DiffHeader>
 *     <DiffPath />
 *     <DiffStat />
 *   </DiffHeader>
 *   <DiffBody />
 * </Diff>
 * ```
 */
export const Diff = React.forwardRef<HTMLDivElement, DiffProps>(
  function Diff(
    { path, before = "", after = "", streaming = false, asChild = false, children, ...rest },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const labelId = `handoff-diff-${reactId}-label`;

    // Recomputed on every streamed chunk, so it must stay memoized. The prefix
    // and suffix trim inside `diffLines` keeps the common append case cheap.
    const result = React.useMemo(() => diffLines(before, after), [before, after]);

    const Comp = resolveElement(asChild, "div");

    return (
      <DiffProvider value={{ path, result, streaming, labelId }}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="diff"
          data-streaming={streaming ? "" : undefined}
          data-approximate={result.approximate ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </DiffProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Header
 * ---------------------------------------------------------------------- */

export interface DiffHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const DiffHeader = React.forwardRef<HTMLDivElement, DiffHeaderProps>(
  function DiffHeader({ asChild = false, ...rest }, forwardedRef) {
    const Comp = resolveElement(asChild, "div");
    return <Comp ref={forwardedRef} data-handoff-slot="diff-header" {...rest} />;
  },
);

export interface DiffPathProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The file path. Names the diff for assistive tech. */
export const DiffPath = React.forwardRef<HTMLSpanElement, DiffPathProps>(
  function DiffPath({ asChild = false, children, ...rest }, forwardedRef) {
    const { path, labelId } = useDiffContext("DiffPath");
    const Comp = resolveElement(asChild, "span");
    return (
      <Comp ref={forwardedRef} id={labelId} {...rest}>
        {children ?? path}
      </Comp>
    );
  },
);

export interface DiffStatProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * Added and removed line counts.
 *
 * The `+12 −3` shorthand is read out as punctuation soup, so the spoken version
 * is spelled out separately.
 */
export const DiffStat = React.forwardRef<HTMLSpanElement, DiffStatProps>(
  function DiffStat({ asChild = false, children, ...rest }, forwardedRef) {
    const { result } = useDiffContext("DiffStat");
    const { additions, deletions } = result;
    const Comp = resolveElement(asChild, "span");

    if (children !== undefined) {
      return (
        <Comp ref={forwardedRef} {...rest}>
          {children}
        </Comp>
      );
    }

    return (
      <Comp ref={forwardedRef} data-handoff-slot="diff-stat" {...rest}>
        <span aria-hidden="true">
          +{additions} −{deletions}
        </span>
        <span style={visuallyHidden}>
          {additions} {additions === 1 ? "addition" : "additions"}, {deletions}{" "}
          {deletions === 1 ? "deletion" : "deletions"}
        </span>
      </Comp>
    );
  },
);

/* -------------------------------------------------------------------------
 * Body
 * ---------------------------------------------------------------------- */

const LINE_PREFIX: Record<DiffLine["type"], string> = {
  add: "Added",
  remove: "Removed",
  context: "",
};

export interface DiffBodyProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, "children"> {
  /** Render a line yourself. Receives the computed line and its index. */
  renderLine?: (line: DiffLine, index: number) => React.ReactNode;
  /**
   * Hide unchanged lines, keeping this many either side of a change.
   * Omit to show the whole file.
   */
  contextLines?: number;
  asChild?: boolean;
}

/**
 * The diff lines, as an ordered list.
 *
 * A `<table>` would let screen readers navigate by column, but line numbers and
 * code are not really tabular data and the gutter ends up announced on every
 * cell. An ordered list with a spoken "Added"/"Removed" prefix reads far closer
 * to how a sighted user scans the change.
 */
export const DiffBody = React.forwardRef<HTMLOListElement, DiffBodyProps>(
  function DiffBody(
    { renderLine, contextLines, asChild = false, ...rest },
    forwardedRef,
  ) {
    const { result, labelId, streaming } = useDiffContext("DiffBody");

    const visible = React.useMemo(
      () => collapseContext(result.lines, contextLines),
      [result.lines, contextLines],
    );

    const Comp = resolveElement(asChild, "ol");

    return (
      <Comp
        ref={forwardedRef}
        aria-labelledby={labelId}
        aria-busy={streaming || undefined}
        data-handoff-slot="diff-body"
        {...rest}
      >
        {visible.map((line, index) =>
          renderLine ? (
            renderLine(line, index)
          ) : (
            <li
              key={`${line.type}-${line.beforeLine ?? "x"}-${line.afterLine ?? "x"}-${index}`}
              data-type={line.type}
              data-before-line={line.beforeLine}
              data-after-line={line.afterLine}
            >
              {LINE_PREFIX[line.type] ? (
                <span style={visuallyHidden}>{LINE_PREFIX[line.type]} </span>
              ) : null}
              <span data-handoff-slot="diff-line-content">{line.content}</span>
            </li>
          ),
        )}
      </Comp>
    );
  },
);

/**
 * Drop unchanged lines that are far from any change.
 *
 * Agents often rewrite one function in a thousand-line file; rendering the
 * whole thing buries the change and costs a lot of DOM nodes.
 */
function collapseContext(
  lines: readonly DiffLine[],
  contextLines: number | undefined,
): DiffLine[] {
  if (contextLines === undefined) return [...lines];

  const keep = new Array<boolean>(lines.length).fill(false);
  lines.forEach((line, index) => {
    if (line.type === "context") return;
    const from = Math.max(0, index - contextLines);
    const to = Math.min(lines.length - 1, index + contextLines);
    for (let i = from; i <= to; i++) keep[i] = true;
  });

  return lines.filter((_, index) => keep[index]);
}
