import * as React from "react";
import type { SourceRef } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";
import { visuallyHidden } from "../utils/visually-hidden";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface CitationContextValue {
  source: SourceRef;
  index: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  cardId: string;
}

const [CitationProvider, useCitationContext] =
  createContext<CitationContextValue>("Citation");

/** Read the enclosing citation's source and open state. */
export function useCitation(): CitationContextValue {
  return useCitationContext("useCitation");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface CitationProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onChange"> {
  source: SourceRef;
  /** 1-based marker number shown in the chip. */
  index: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Open the card on pointer hover as well as focus. */
  openOnHover?: boolean;
  asChild?: boolean;
}

/**
 * An inline source reference with an expandable card.
 *
 * Built as a disclosure rather than a tooltip: tooltips cannot be reached by
 * keyboard or touch, and a citation whose source only appears on mouse hover is
 * a citation half the readers cannot check.
 *
 * ```tsx
 * <Citation source={source} index={1}>
 *   <CitationTrigger />
 *   <CitationCard>
 *     <CitationTitle />
 *     <CitationSnippet />
 *   </CitationCard>
 * </Citation>
 * ```
 */
export const Citation = React.forwardRef<HTMLSpanElement, CitationProps>(
  function Citation(
    {
      source,
      index,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      openOnHover = true,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const triggerId = `handoff-cite-${reactId}-trigger`;
    const cardId = `handoff-cite-${reactId}-card`;

    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    const Comp = resolveElement(asChild, "span");

    return (
      <CitationProvider
        value={{ source, index, open, setOpen, triggerId, cardId }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="citation"
          data-state={open ? "open" : "closed"}
          onMouseEnter={openOnHover ? () => setOpen(true) : undefined}
          onMouseLeave={openOnHover ? () => setOpen(false) : undefined}
          onKeyDown={(event: React.KeyboardEvent<HTMLSpanElement>) => {
            if (event.key === "Escape" && open) {
              event.stopPropagation();
              setOpen(false);
            }
          }}
          // Focus leaving the whole citation closes the card; moving between
          // the chip and a link inside the card must not.
          onBlur={(event: React.FocusEvent<HTMLSpanElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setOpen(false);
            }
          }}
          {...rest}
        >
          {children}
        </Comp>
      </CitationProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface CitationTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** The inline marker, e.g. `[1]`. */
export const CitationTrigger = React.forwardRef<
  HTMLButtonElement,
  CitationTriggerProps
>(function CitationTrigger(
  { asChild = false, onClick, onFocus, onBlur, onPointerDown, children, ...rest },
  forwardedRef,
) {
  const { index, source, open, setOpen, triggerId, cardId } =
    useCitationContext("CitationTrigger");

  // A pointer press focuses the button before it clicks it. Opening on that
  // focus would let the click that follows immediately toggle the card shut,
  // so pointer-driven focus is recorded and skipped.
  const pointerFocus = React.useRef(false);

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={cardId}
      data-state={open ? "open" : "closed"}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        pointerFocus.current = true;
      }}
      onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);
        // Keyboard focus alone reveals the source, so tabbing through an
        // answer surfaces its citations without any extra keystroke.
        if (!pointerFocus.current) setOpen(true);
      }}
      onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
        onBlur?.(event);
        pointerFocus.current = false;
      }}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        pointerFocus.current = false;
        setOpen(!open);
      }}
      {...rest}
    >
      {children ?? <span aria-hidden="true">{index}</span>}
      {/* "1" alone tells a screen reader nothing about what it refers to. */}
      <span style={visuallyHidden}>{`Source ${index}: ${source.title}`}</span>
    </Comp>
  );
});

/* -------------------------------------------------------------------------
 * Card
 * ---------------------------------------------------------------------- */

export interface CitationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  asChild?: boolean;
}

/** The expandable source preview. */
export const CitationCard = React.forwardRef<HTMLDivElement, CitationCardProps>(
  function CitationCard({ forceMount = false, asChild = false, ...rest }, forwardedRef) {
    const { open, cardId, triggerId } = useCitationContext("CitationCard");
    if (!open && !forceMount) return null;

    const Comp = resolveElement(asChild, "div");

    return (
      <Comp
        ref={forwardedRef}
        id={cardId}
        role="group"
        aria-labelledby={triggerId}
        data-state={open ? "open" : "closed"}
        hidden={!open}
        {...rest}
      />
    );
  },
);

export interface CitationTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const CitationTitle = React.forwardRef<HTMLDivElement, CitationTitleProps>(
  function CitationTitle({ asChild = false, children, ...rest }, forwardedRef) {
    const { source } = useCitationContext("CitationTitle");
    const Comp = resolveElement(asChild, "div");
    return (
      <Comp ref={forwardedRef} {...rest}>
        {children ?? source.title}
      </Comp>
    );
  },
);

export interface CitationSnippetProps
  extends React.HTMLAttributes<HTMLQuoteElement> {
  asChild?: boolean;
}

/** The excerpt the answer drew on, marked up as the quotation it is. */
export const CitationSnippet = React.forwardRef<
  HTMLQuoteElement,
  CitationSnippetProps
>(function CitationSnippet({ asChild = false, children, ...rest }, forwardedRef) {
  const { source } = useCitationContext("CitationSnippet");
  if (!source.snippet && children === undefined) return null;

  const Comp = resolveElement(asChild, "blockquote");
  return (
    <Comp ref={forwardedRef} cite={source.url} {...rest}>
      {children ?? source.snippet}
    </Comp>
  );
});

export interface CitationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

/** Link out to the source. Renders nothing when the source has no URL. */
export const CitationLink = React.forwardRef<HTMLAnchorElement, CitationLinkProps>(
  function CitationLink({ asChild = false, children, ...rest }, forwardedRef) {
    const { source } = useCitationContext("CitationLink");
    if (!source.url) return null;

    const Comp = resolveElement(asChild, "a");
    return (
      <Comp
        ref={forwardedRef}
        href={source.url}
        target="_blank"
        // Without noreferrer the opened page can reach back through
        // window.opener.
        rel="noopener noreferrer"
        {...rest}
      >
        {children ?? source.url}
        <span style={visuallyHidden}> (opens in a new tab)</span>
      </Comp>
    );
  },
);
