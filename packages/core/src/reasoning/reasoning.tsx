import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";
import { useElapsed } from "../utils/use-elapsed";
import { formatDuration } from "../utils/format";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface ReasoningContextValue {
  text: string;
  streaming: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  elapsed: number | null;
  triggerId: string;
  panelId: string;
}

const [ReasoningProvider, useReasoningContext] =
  createContext<ReasoningContextValue>("Reasoning");

/** Read the enclosing reasoning block's state. */
export function useReasoning(): ReasoningContextValue {
  return useReasoningContext("useReasoning");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ReasoningProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Reasoning text. Grows as tokens arrive. */
  text: string;
  /** True while tokens are still streaming in. */
  streaming?: boolean;
  startedAt?: number;
  endedAt?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Expand while streaming and collapse once finished — the pattern users know
   * from Claude and ChatGPT, where thinking is visible live but folds away so
   * it does not bury the answer.
   *
   * Only applies while uncontrolled, and stops the moment the user clicks: an
   * explicit choice is never overridden.
   */
  autoCollapse?: boolean;
  asChild?: boolean;
}

/**
 * A collapsible block of model reasoning.
 *
 * ```tsx
 * <Reasoning text={part.text} streaming={part.streaming} autoCollapse>
 *   <ReasoningTrigger>
 *     <ReasoningLabel />
 *   </ReasoningTrigger>
 *   <ReasoningPanel>
 *     <ReasoningText />
 *   </ReasoningPanel>
 * </Reasoning>
 * ```
 */
export const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  function Reasoning(
    {
      text,
      streaming = false,
      startedAt,
      endedAt,
      open: openProp,
      defaultOpen,
      onOpenChange,
      autoCollapse = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const triggerId = `handoff-reasoning-${reactId}-trigger`;
    const panelId = `handoff-reasoning-${reactId}-panel`;

    const isControlled = openProp !== undefined;
    const userInteracted = React.useRef(false);

    const [open = false, setOpenState] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? (autoCollapse ? streaming : false),
      onChange: onOpenChange,
    });

    const setOpen = React.useCallback(
      (next: boolean) => {
        userInteracted.current = true;
        setOpenState(next);
      },
      [setOpenState],
    );

    // Collapse on the streaming -> settled edge only. Watching `streaming`
    // directly would re-collapse on every unrelated re-render.
    const wasStreaming = React.useRef(streaming);
    React.useEffect(() => {
      const justFinished = wasStreaming.current && !streaming;
      wasStreaming.current = streaming;

      if (!autoCollapse || isControlled || userInteracted.current) return;
      if (justFinished) setOpenState(false);
    }, [streaming, autoCollapse, isControlled, setOpenState]);

    const elapsed = useElapsed({ startedAt, endedAt, active: streaming });

    const context: ReasoningContextValue = {
      text,
      streaming,
      open,
      setOpen,
      elapsed,
      triggerId,
      panelId,
    };

    const Comp = resolveElement(asChild, "div");

    return (
      <ReasoningProvider value={context}>
        <Comp
          ref={forwardedRef}
          data-handoff-part="reasoning"
          data-state={open ? "open" : "closed"}
          data-streaming={streaming ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </ReasoningProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface ReasoningTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const ReasoningTrigger = React.forwardRef<
  HTMLButtonElement,
  ReasoningTriggerProps
>(function ReasoningTrigger({ asChild = false, onClick, ...rest }, forwardedRef) {
  const { open, setOpen, triggerId, panelId, streaming } =
    useReasoningContext("ReasoningTrigger");

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      data-state={open ? "open" : "closed"}
      data-streaming={streaming ? "" : undefined}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setOpen(!open);
      }}
      {...rest}
    />
  );
});

/* -------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------- */

export interface ReasoningLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * Status text: `Thinking…` while streaming, `Thought for 4.2s` once settled.
 * Falls back to a plain label when no timing information was supplied.
 */
export const ReasoningLabel = React.forwardRef<
  HTMLSpanElement,
  ReasoningLabelProps
>(function ReasoningLabel({ asChild = false, children, ...rest }, forwardedRef) {
  const { streaming, elapsed } = useReasoningContext("ReasoningLabel");

  let label: string;
  if (children !== undefined) {
    label = "";
  } else if (streaming) {
    label = "Thinking…";
  } else if (elapsed !== null) {
    label = `Thought for ${formatDuration(elapsed)}`;
  } else {
    label = "Reasoning";
  }

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} {...rest}>
      {children ?? label}
    </Comp>
  );
});

/* -------------------------------------------------------------------------
 * Panel
 * ---------------------------------------------------------------------- */

export interface ReasoningPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  asChild?: boolean;
}

export const ReasoningPanel = React.forwardRef<
  HTMLDivElement,
  ReasoningPanelProps
>(function ReasoningPanel(
  { forceMount = false, asChild = false, ...rest },
  forwardedRef,
) {
  const { open, panelId, triggerId } = useReasoningContext("ReasoningPanel");

  if (!open && !forceMount) return null;

  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={forwardedRef}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      data-state={open ? "open" : "closed"}
      hidden={!open}
      {...rest}
    />
  );
});

/* -------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------- */

export interface ReasoningTextProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * The reasoning body.
 *
 * Streaming text is wrapped in a polite live region so screen reader users hear
 * it as it arrives. Once settled the region is switched off, otherwise every
 * later re-render would re-announce the whole block.
 */
export const ReasoningText = React.forwardRef<HTMLDivElement, ReasoningTextProps>(
  function ReasoningText({ asChild = false, children, ...rest }, forwardedRef) {
    const { text, streaming } = useReasoningContext("ReasoningText");
    const Comp = resolveElement(asChild, "div");

    return (
      <Comp
        ref={forwardedRef}
        aria-live={streaming ? "polite" : "off"}
        aria-busy={streaming || undefined}
        data-handoff-slot="reasoning-text"
        {...rest}
      >
        {children ?? text}
      </Comp>
    );
  },
);
