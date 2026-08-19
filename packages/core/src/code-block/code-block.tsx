import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

type CopyState = "idle" | "copied" | "error";

interface CodeBlockContextValue {
  code: string;
  language: string | undefined;
  filename: string | undefined;
  streaming: boolean;
  copyState: CopyState;
  copy: () => void;
  labelId: string;
}

const [CodeBlockProvider, useCodeBlockContext] =
  createContext<CodeBlockContextValue>("CodeBlock");

/** Read the block's code and copy state. */
export function useCodeBlock(): CodeBlockContextValue {
  return useCodeBlockContext("useCodeBlock");
}

/**
 * Put the string on the clipboard.
 *
 * The async Clipboard API needs a secure context, which rules it out on plain
 * HTTP and in some embedded webviews, so the old selection trick stays as a
 * fallback rather than leaving copy silently broken there.
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context. Fall through.
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  /** Language id, shown as a label and exposed for highlighters. */
  language?: string;
  /** Optional file path shown in the header. */
  filename?: string;
  /** True while the code is still being written. */
  streaming?: boolean;
  /** How long the copied confirmation stays up, in milliseconds. */
  copyFeedbackMs?: number;
  asChild?: boolean;
}

/**
 * A block of code with a copy button.
 *
 * Highlighting is deliberately left out. Every project already has a
 * highlighter it likes, and bundling one would add more weight than the rest of
 * this library combined, so `CodeBlockBody` takes a render prop instead.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  function CodeBlock(
    {
      code,
      language,
      filename,
      streaming = false,
      copyFeedbackMs = 2000,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const labelId = `handoff-code-${reactId}-label`;

    const [copyState, setCopyState] = React.useState<CopyState>("idle");
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    React.useEffect(() => () => clearTimeout(timerRef.current), []);

    const copy = React.useCallback(() => {
      void writeClipboard(code).then((ok) => {
        setCopyState(ok ? "copied" : "error");
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopyState("idle"), copyFeedbackMs);
      });
    }, [code, copyFeedbackMs]);

    const Comp = resolveElement(asChild, "div");

    return (
      <CodeBlockProvider
        value={{ code, language, filename, streaming, copyState, copy, labelId }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="code-block"
          data-language={language}
          data-streaming={streaming ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </CodeBlockProvider>
    );
  },
);

export interface CodeBlockHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const CodeBlockHeader = React.forwardRef<
  HTMLDivElement,
  CodeBlockHeaderProps
>(function CodeBlockHeader({ asChild = false, ...rest }, forwardedRef) {
  const Comp = resolveElement(asChild, "div");
  return <Comp ref={forwardedRef} data-handoff-slot="code-header" {...rest} />;
});

export interface CodeBlockLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The filename if there is one, otherwise the language. */
export const CodeBlockLabel = React.forwardRef<
  HTMLSpanElement,
  CodeBlockLabelProps
>(function CodeBlockLabel({ asChild = false, children, ...rest }, forwardedRef) {
  const { filename, language, labelId } = useCodeBlockContext("CodeBlockLabel");
  const text = children ?? filename ?? language;
  if (!text) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} id={labelId} {...rest}>
      {text}
    </Comp>
  );
});

export interface CodeBlockCopyProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  copiedLabel?: React.ReactNode;
  errorLabel?: React.ReactNode;
  asChild?: boolean;
}

/**
 * Copy the code.
 *
 * The result goes through a live region as well as the label, because a button
 * whose text quietly changes to "Copied" tells a screen reader user nothing.
 */
export const CodeBlockCopy = React.forwardRef<
  HTMLButtonElement,
  CodeBlockCopyProps
>(function CodeBlockCopy(
  { asChild = false, onClick, children, copiedLabel, errorLabel, ...rest },
  forwardedRef,
) {
  const { copy, copyState } = useCodeBlockContext("CodeBlockCopy");
  const Comp = resolveElement(asChild, "button");

  const label =
    copyState === "copied"
      ? (copiedLabel ?? "Copied")
      : copyState === "error"
        ? (errorLabel ?? "Press Ctrl+C")
        : (children ?? "Copy");

  return (
    <>
      <Comp
        ref={forwardedRef}
        type="button"
        data-handoff-slot="copy"
        data-state={copyState}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          copy();
        }}
        {...rest}
      >
        {label}
      </Comp>
      <span role="status" aria-live="polite" style={visuallyHidden}>
        {copyState === "copied"
          ? "Copied to clipboard"
          : copyState === "error"
            ? "Copying failed. Select the code and press Control C."
            : ""}
      </span>
    </>
  );
});

export interface CodeBlockBodyProps
  extends Omit<React.HTMLAttributes<HTMLPreElement>, "children"> {
  /** Show a line number gutter. */
  showLineNumbers?: boolean;
  /**
   * Render the code yourself, for syntax highlighting. Receives the raw string.
   * Whatever you return must preserve whitespace.
   */
  renderCode?: (code: string, language: string | undefined) => React.ReactNode;
}

/** The code itself, as real `pre` and `code` elements. */
export const CodeBlockBody = React.forwardRef<HTMLPreElement, CodeBlockBodyProps>(
  function CodeBlockBody(
    { showLineNumbers = false, renderCode, ...rest },
    forwardedRef,
  ) {
    const { code, language, streaming, labelId } =
      useCodeBlockContext("CodeBlockBody");

    const lines = React.useMemo(() => code.split("\n"), [code]);

    return (
      <pre
        ref={forwardedRef}
        // Scrollable, so it has to be reachable by keyboard.
        tabIndex={0}
        aria-labelledby={labelId}
        aria-busy={streaming || undefined}
        data-handoff-slot="code-body"
        {...rest}
      >
        <code className={language ? `language-${language}` : undefined}>
          {renderCode ? (
            renderCode(code, language)
          ) : showLineNumbers ? (
            lines.map((line, index) => (
              <span key={index} data-handoff-slot="code-line">
                <span aria-hidden="true" data-handoff-slot="code-gutter">
                  {index + 1}
                </span>
                {line}
                {index < lines.length - 1 ? "\n" : null}
              </span>
            ))
          ) : (
            code
          )}
        </code>
      </pre>
    );
  },
);
