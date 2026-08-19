import * as React from "react";
import type { LogLine } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";
import { parseAnsi } from "../utils/ansi";
import type { AnsiSegment } from "../utils/ansi";
import { useStickToBottom } from "../utils/use-stick-to-bottom";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface LogStreamContextValue {
  lines: readonly LogLine[];
  streaming: boolean;
  announce: boolean;
  label: string;
  isPinned: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  viewportRef: React.RefCallback<HTMLDivElement>;
}

const [LogStreamProvider, useLogStreamContext] =
  createContext<LogStreamContextValue>("LogStream");

/** Read the log's state — including whether it is still following output. */
export function useLogStream(): LogStreamContextValue {
  return useLogStreamContext("useLogStream");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface LogStreamProps extends React.HTMLAttributes<HTMLDivElement> {
  lines: readonly LogLine[];
  /** True while output is still arriving. Controls whether autoscroll runs. */
  streaming?: boolean;
  /** Accessible name for the scrollable region. */
  label?: string;
  /**
   * Announce new lines to screen readers.
   *
   * Off by default, and deliberately so: a build emitting hundreds of lines a
   * second through a live region makes the page unusable. Turn it on only for
   * low-volume output the user is genuinely waiting on.
   */
  announce?: boolean;
  asChild?: boolean;
}

/**
 * Streaming process output with ANSI colour and sane autoscroll.
 *
 * ```tsx
 * <LogStream lines={lines} streaming label="Build output">
 *   <LogStreamViewport>
 *     <LogStreamLines />
 *   </LogStreamViewport>
 *   <LogStreamFollowButton />
 * </LogStream>
 * ```
 */
export const LogStream = React.forwardRef<HTMLDivElement, LogStreamProps>(
  function LogStream(
    {
      lines,
      streaming = false,
      label = "Output",
      announce = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const { ref: viewportRef, isPinned, scrollToBottom } =
      useStickToBottom<HTMLDivElement>({ enabled: streaming });

    const Comp = resolveElement(asChild, "div");

    return (
      <LogStreamProvider
        value={{
          lines,
          streaming,
          announce,
          label,
          isPinned,
          scrollToBottom,
          viewportRef,
        }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="log-stream"
          data-streaming={streaming ? "" : undefined}
          data-pinned={isPinned ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </LogStreamProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Viewport
 * ---------------------------------------------------------------------- */

export interface LogStreamViewportProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * The scrolling region.
 *
 * Focusable on purpose: a scrollable box that keyboard users cannot reach is a
 * WCAG failure, and there is no other way to page through old output.
 */
export const LogStreamViewport = React.forwardRef<
  HTMLDivElement,
  LogStreamViewportProps
>(function LogStreamViewport({ asChild = false, ...rest }, forwardedRef) {
  const { viewportRef, label, announce, streaming } =
    useLogStreamContext("LogStreamViewport");

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef(node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [viewportRef, forwardedRef],
  );

  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={setRefs}
      role="log"
      tabIndex={0}
      aria-label={label}
      aria-live={announce ? "polite" : "off"}
      aria-busy={streaming || undefined}
      data-handoff-slot="log-viewport"
      {...rest}
    />
  );
});

/* -------------------------------------------------------------------------
 * Lines
 * ---------------------------------------------------------------------- */

export interface LogStreamLinesProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Render a line yourself, receiving its parsed ANSI segments. */
  renderLine?: (
    line: LogLine,
    segments: AnsiSegment[],
    index: number,
  ) => React.ReactNode;
  asChild?: boolean;
}

/** The parsed lines. */
export const LogStreamLines = React.forwardRef<
  HTMLDivElement,
  LogStreamLinesProps
>(function LogStreamLines({ renderLine, asChild = false, ...rest }, forwardedRef) {
  const { lines } = useLogStreamContext("LogStreamLines");

  // Parsing is pure but not free, and a streaming log re-renders constantly.
  const parsed = React.useMemo(
    () => lines.map((line) => parseAnsi(line.text)),
    [lines],
  );

  const Comp = resolveElement(asChild, "div");

  return (
    <Comp ref={forwardedRef} data-handoff-slot="log-lines" {...rest}>
      {lines.map((line, index) => {
        const segments = parsed[index] as AnsiSegment[];
        if (renderLine) return renderLine(line, segments, index);

        return (
          <div
            key={line.id}
            data-stream={line.stream ?? "stdout"}
            data-handoff-slot="log-line"
          >
            {line.stream === "stderr" ? (
              <span style={visuallyHidden}>Error output: </span>
            ) : null}
            {segments.map((segment, segmentIndex) => (
              <LogSegment key={segmentIndex} segment={segment} />
            ))}
            {/* Blank lines still need height, or the log collapses. */}
            {segments.length === 0 ? " " : null}
          </div>
        );
      })}
    </Comp>
  );
});

/**
 * One styled run of text.
 *
 * Named colours become data attributes so a theme can map them, while exact
 * 256-colour and truecolor values are applied inline — there is nothing
 * meaningful for a theme to do with `#5f8700`.
 */
function LogSegment({ segment }: { segment: AnsiSegment }) {
  const isNamed = (value: string | undefined) =>
    value !== undefined && !value.startsWith("#");

  return (
    <span
      data-fg={isNamed(segment.fg) ? segment.fg : undefined}
      data-bg={isNamed(segment.bg) ? segment.bg : undefined}
      data-bold={segment.bold ? "" : undefined}
      data-dim={segment.dim ? "" : undefined}
      data-italic={segment.italic ? "" : undefined}
      data-underline={segment.underline ? "" : undefined}
      style={{
        color: segment.fg?.startsWith("#") ? segment.fg : undefined,
        backgroundColor: segment.bg?.startsWith("#") ? segment.bg : undefined,
        fontWeight: segment.bold ? 600 : undefined,
        opacity: segment.dim ? 0.6 : undefined,
        fontStyle: segment.italic ? "italic" : undefined,
        textDecoration: segment.underline
          ? "underline"
          : segment.strike
            ? "line-through"
            : undefined,
      }}
    >
      {segment.text}
    </span>
  );
}

/* -------------------------------------------------------------------------
 * Follow button
 * ---------------------------------------------------------------------- */

export interface LogStreamFollowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/**
 * Jump back to the newest output.
 *
 * Rendered only once the user has scrolled away, since it is meaningless while
 * the view is already following.
 */
export const LogStreamFollowButton = React.forwardRef<
  HTMLButtonElement,
  LogStreamFollowButtonProps
>(function LogStreamFollowButton(
  { asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { isPinned, scrollToBottom, streaming } =
    useLogStreamContext("LogStreamFollowButton");

  if (isPinned || !streaming) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      data-handoff-slot="follow"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        scrollToBottom("smooth");
      }}
      {...rest}
    >
      {children ?? "Jump to latest"}
    </Comp>
  );
});
