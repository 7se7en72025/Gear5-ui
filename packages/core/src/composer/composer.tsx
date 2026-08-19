import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";
import { visuallyHidden } from "../utils/visually-hidden";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface ComposerContextValue {
  value: string;
  setValue: (value: string) => void;
  submit: () => void;
  stop: () => void;
  busy: boolean;
  disabled: boolean;
  canSubmit: boolean;
  inputId: string;
  hintId: string;
}

const [ComposerProvider, useComposerContext] =
  createContext<ComposerContextValue>("Composer");

/** Read the composer's state — for custom toolbar controls. */
export function useComposer(): ComposerContextValue {
  return useComposerContext("useComposer");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ComposerProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed value. Not called while busy or empty. */
  onSubmit?: (value: string) => void;
  /** Called when the user stops a run in progress. */
  onStop?: () => void;
  /** True while the agent is running. Swaps submit for stop. */
  busy?: boolean;
  disabled?: boolean;
  asChild?: boolean;
}

/**
 * The prompt input.
 *
 * A real `<form>`, so Enter-to-submit, mobile keyboards' "go" key, and
 * assistive tech all behave the way they already do everywhere else.
 *
 * ```tsx
 * <Composer value={value} onValueChange={setValue} onSubmit={send} busy={isRunning} onStop={abort}>
 *   <ComposerInput placeholder="Ask the agent…" />
 *   <ComposerToolbar>
 *     <ComposerHint />
 *     <ComposerSubmit />
 *   </ComposerToolbar>
 * </Composer>
 * ```
 */
export const Composer = React.forwardRef<HTMLFormElement, ComposerProps>(
  function Composer(
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      onStop,
      busy = false,
      disabled = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const inputId = `handoff-composer-${reactId}-input`;
    const hintId = `handoff-composer-${reactId}-hint`;

    const [value = "", setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const canSubmit = value.trim().length > 0 && !busy && !disabled;

    const submit = React.useCallback(() => {
      if (!canSubmit) return;
      onSubmit?.(value.trim());
    }, [canSubmit, onSubmit, value]);

    const stop = React.useCallback(() => {
      if (!busy) return;
      onStop?.();
    }, [busy, onStop]);

    const Comp = resolveElement(asChild, "form");

    return (
      <ComposerProvider
        value={{
          value,
          setValue,
          submit,
          stop,
          busy,
          disabled,
          canSubmit,
          inputId,
          hintId,
        }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="composer"
          data-busy={busy ? "" : undefined}
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            submit();
          }}
          {...rest}
        >
          {children}
        </Comp>
      </ComposerProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------- */

export interface ComposerInputProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  > {
  /** Grow up to this many rows, then scroll. */
  maxRows?: number;
  /** Submit on Enter, with Shift+Enter inserting a newline. */
  submitOnEnter?: boolean;
}

/** Auto-resizing prompt textarea. */
export const ComposerInput = React.forwardRef<
  HTMLTextAreaElement,
  ComposerInputProps
>(function ComposerInput(
  { maxRows = 10, submitOnEnter = true, onKeyDown, rows = 1, ...rest },
  forwardedRef,
) {
  const { value, setValue, submit, disabled, inputId, hintId } =
    useComposerContext("ComposerInput");

  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  // Resize after every value change. Height must be reset to auto first or the
  // box can only ever grow, never shrink back down.
  React.useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;

    node.style.height = "auto";

    const styles = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
    const padding =
      Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const max = lineHeight * maxRows + padding;

    node.style.height = `${Math.min(node.scrollHeight, max)}px`;
    node.style.overflowY = node.scrollHeight > max ? "auto" : "hidden";
  }, [value, maxRows]);

  // Enter commits a composition in Japanese, Chinese, and Korean input methods.
  // Submitting on that keystroke swallows the first word the user typed.
  const composingRef = React.useRef(false);

  return (
    <textarea
      ref={setRefs}
      id={inputId}
      rows={rows}
      value={value}
      disabled={disabled}
      aria-describedby={hintId}
      data-handoff-slot="composer-input"
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={() => {
        composingRef.current = false;
      }}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        if (
          submitOnEnter &&
          event.key === "Enter" &&
          !event.shiftKey &&
          !composingRef.current &&
          // Safari fires keydown for the composition commit without setting
          // isComposing on the React event, so check both.
          !event.nativeEvent.isComposing
        ) {
          event.preventDefault();
          submit();
        }
      }}
      {...rest}
    />
  );
});

/* -------------------------------------------------------------------------
 * Toolbar
 * ---------------------------------------------------------------------- */

export interface ComposerToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const ComposerToolbar = React.forwardRef<
  HTMLDivElement,
  ComposerToolbarProps
>(function ComposerToolbar({ asChild = false, ...rest }, forwardedRef) {
  const Comp = resolveElement(asChild, "div");
  return <Comp ref={forwardedRef} data-handoff-slot="composer-toolbar" {...rest} />;
});

export interface ComposerHintProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** Keyboard hint, wired as the input's description. */
export const ComposerHint = React.forwardRef<HTMLSpanElement, ComposerHintProps>(
  function ComposerHint({ asChild = false, children, ...rest }, forwardedRef) {
    const { hintId } = useComposerContext("ComposerHint");
    const Comp = resolveElement(asChild, "span");
    return (
      <Comp ref={forwardedRef} id={hintId} {...rest}>
        {children ?? "Enter to send, Shift+Enter for a new line"}
      </Comp>
    );
  },
);

/* -------------------------------------------------------------------------
 * Submit / stop
 * ---------------------------------------------------------------------- */

export interface ComposerSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Label while the agent is running. */
  stopLabel?: React.ReactNode;
  asChild?: boolean;
}

/**
 * Send, or stop while a run is in flight.
 *
 * One button rather than two: the action a user wants is always determined by
 * whether the agent is currently working, and a permanently disabled second
 * button is just noise.
 */
export const ComposerSubmit = React.forwardRef<
  HTMLButtonElement,
  ComposerSubmitProps
>(function ComposerSubmit(
  { asChild = false, onClick, children, stopLabel, ...rest },
  forwardedRef,
) {
  const { busy, canSubmit, stop } = useComposerContext("ComposerSubmit");
  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      // Stop must be a plain button: letting it submit the form would send the
      // draft prompt at the same moment the user is trying to cancel.
      type={busy ? "button" : "submit"}
      disabled={!busy && !canSubmit}
      data-handoff-slot={busy ? "stop" : "submit"}
      data-busy={busy ? "" : undefined}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (busy) stop();
      }}
      {...rest}
    >
      {busy ? (stopLabel ?? "Stop") : (children ?? "Send")}
    </Comp>
  );
});

export interface ComposerCountProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Warn once the draft passes this length. */
  max?: number;
  asChild?: boolean;
}

/** Character count, shown only once it starts to matter. */
export const ComposerCount = React.forwardRef<HTMLSpanElement, ComposerCountProps>(
  function ComposerCount({ max, asChild = false, children, ...rest }, forwardedRef) {
    const { value } = useComposerContext("ComposerCount");
    if (max === undefined || value.length < max * 0.8) return null;

    const over = value.length > max;
    const Comp = resolveElement(asChild, "span");

    return (
      <Comp
        ref={forwardedRef}
        // Announced politely rather than on every keystroke.
        role="status"
        data-over={over ? "" : undefined}
        {...rest}
      >
        <span aria-hidden="true">
          {value.length}/{max}
        </span>
        <span style={visuallyHidden}>
          {over
            ? `${value.length - max} characters over the limit`
            : `${max - value.length} characters remaining`}
        </span>
      </Comp>
    );
  },
);
