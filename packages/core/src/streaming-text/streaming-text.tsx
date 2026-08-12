import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

interface StreamingTextContextValue {
  text: string;
  streaming: boolean;
}

const [StreamingTextProvider, useStreamingTextContext] =
  createContext<StreamingTextContextValue>("StreamingText");

/** Read the text and whether it is still arriving. */
export function useStreamingText(): StreamingTextContextValue {
  return useStreamingTextContext("useStreamingText");
}

/**
 * Index just past the last sentence ending in `text`, or null if there is none.
 *
 * Closing quotes and brackets are allowed to follow the punctuation so a quoted
 * sentence is not cut in the wrong place.
 */
function lastSentenceEnd(text: string): number | null {
  const pattern = /[.!?]["'’”)\]]*(\s|$)/g;
  let end: number | null = null;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    end = match.index + match[0].length;
  }
  return end;
}

export interface StreamingTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  streaming?: boolean;
  /**
   * Read the text aloud as it arrives.
   *
   * On by default, because this is model output and it is usually the answer.
   */
  announce?: boolean;
  asChild?: boolean;
}

/**
 * Model output that streams in.
 *
 * The naive approach puts `aria-live` on the growing element, which makes a
 * screen reader restart the whole paragraph on every token. Here the visible
 * text is hidden from assistive tech and a separate region is fed one completed
 * sentence at a time, so it reads the way a person would.
 *
 * ```tsx
 * <StreamingText text={part.text} streaming={part.streaming}>
 *   <StreamingTextBody />
 * </StreamingText>
 * ```
 */
export const StreamingText = React.forwardRef<HTMLDivElement, StreamingTextProps>(
  function StreamingText(
    { text, streaming = false, announce = true, asChild = false, children, ...rest },
    forwardedRef,
  ) {
    const Comp = resolveElement(asChild, "div");

    return (
      <StreamingTextProvider value={{ text, streaming }}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="streaming-text"
          data-streaming={streaming ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
        {announce ? <SentenceAnnouncer text={text} streaming={streaming} /> : null}
      </StreamingTextProvider>
    );
  },
);

function SentenceAnnouncer({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  const announcedTo = React.useRef(0);
  const [spoken, setSpoken] = React.useState("");

  // A new message reuses the component, so reset when the text shrinks.
  if (text.length < announcedTo.current) {
    announcedTo.current = 0;
  }

  React.useEffect(() => {
    if (streaming) {
      const boundary = lastSentenceEnd(text);
      if (boundary !== null && boundary > announcedTo.current) {
        setSpoken(text.slice(announcedTo.current, boundary).trim());
        announcedTo.current = boundary;
      }
      return;
    }

    // Finished. Flush whatever never ended in punctuation.
    const remainder = text.slice(announcedTo.current).trim();
    if (remainder) {
      setSpoken(remainder);
      announcedTo.current = text.length;
    }
  }, [text, streaming]);

  return (
    <div aria-live="polite" aria-atomic="true" style={visuallyHidden}>
      {spoken}
    </div>
  );
}

export interface StreamingTextBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * The visible text.
 *
 * Hidden from assistive tech while streaming, because the announcer is already
 * reading it. Once the stream ends it becomes readable again so the text can be
 * navigated normally.
 */
export const StreamingTextBody = React.forwardRef<
  HTMLDivElement,
  StreamingTextBodyProps
>(function StreamingTextBody({ asChild = false, children, ...rest }, forwardedRef) {
  const { text, streaming } = useStreamingTextContext("StreamingTextBody");
  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={forwardedRef}
      aria-hidden={streaming || undefined}
      data-handoff-slot="streaming-body"
      {...rest}
    >
      {children ?? text}
    </Comp>
  );
});

export interface StreamingTextCaretProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** Blinking caret, shown only while text is arriving. Purely decorative. */
export const StreamingTextCaret = React.forwardRef<
  HTMLSpanElement,
  StreamingTextCaretProps
>(function StreamingTextCaret({ asChild = false, children, ...rest }, forwardedRef) {
  const { streaming } = useStreamingTextContext("StreamingTextCaret");
  if (!streaming) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp
      ref={forwardedRef}
      aria-hidden="true"
      data-handoff-slot="caret"
      {...rest}
    >
      {children ?? "▋"}
    </Comp>
  );
});
