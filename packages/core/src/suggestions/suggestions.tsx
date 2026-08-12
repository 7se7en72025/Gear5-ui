import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";

export interface Suggestion {
  id: string;
  label: string;
  /** Text handed to onSelect. Falls back to the label. */
  value?: string;
}

interface SuggestionsContextValue {
  items: readonly Suggestion[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  select: (item: Suggestion) => void;
  orientation: "horizontal" | "vertical";
  registerItem: (index: number, node: HTMLElement | null) => void;
}

const [SuggestionsProvider, useSuggestionsContext] =
  createContext<SuggestionsContextValue>("Suggestions");

/** Read the list state, for building your own item. */
export function useSuggestions(): SuggestionsContextValue {
  return useSuggestionsContext("useSuggestions");
}

export interface SuggestionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: readonly Suggestion[];
  onSelect?: (value: string, item: Suggestion) => void;
  label?: string;
  orientation?: "horizontal" | "vertical";
  asChild?: boolean;
}

/**
 * Starter or follow up prompts.
 *
 * A toolbar with roving tabindex, not a row of tab stops. Six suggestions
 * should cost one Tab to skip past, not six, and that is the whole reason this
 * pattern exists.
 *
 * ```tsx
 * <Suggestions items={items} onSelect={send} label="Try one of these">
 *   {items.map((item, i) => (
 *     <SuggestionItem key={item.id} item={item} index={i} />
 *   ))}
 * </Suggestions>
 * ```
 */
export const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  function Suggestions(
    {
      items,
      onSelect,
      label = "Suggestions",
      orientation = "horizontal",
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const itemsRef = React.useRef<(HTMLElement | null)[]>([]);

    const registerItem = React.useCallback(
      (index: number, node: HTMLElement | null) => {
        itemsRef.current[index] = node;
      },
      [],
    );

    // The list can shrink between renders, which would otherwise leave the
    // roving index pointing at an element that no longer exists.
    React.useEffect(() => {
      if (activeIndex > items.length - 1) setActiveIndex(Math.max(0, items.length - 1));
    }, [items.length, activeIndex]);

    const select = React.useCallback(
      (item: Suggestion) => onSelect?.(item.value ?? item.label, item),
      [onSelect],
    );

    const move = (next: number) => {
      const count = items.length;
      if (count === 0) return;
      // Wrap around, which is what a toolbar is expected to do.
      const index = (next + count) % count;
      setActiveIndex(index);
      itemsRef.current[index]?.focus();
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const forward = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
      const back = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

      switch (event.key) {
        case forward:
          event.preventDefault();
          move(activeIndex + 1);
          break;
        case back:
          event.preventDefault();
          move(activeIndex - 1);
          break;
        case "Home":
          event.preventDefault();
          move(0);
          break;
        case "End":
          event.preventDefault();
          move(items.length - 1);
          break;
        default:
          break;
      }
    };

    const Comp = resolveElement(asChild, "div");

    return (
      <SuggestionsProvider
        value={{ items, activeIndex, setActiveIndex, select, orientation, registerItem }}
      >
        <Comp
          ref={forwardedRef}
          role="toolbar"
          aria-label={label}
          aria-orientation={orientation}
          data-handoff-part="suggestions"
          data-orientation={orientation}
          onKeyDown={onKeyDown}
          {...rest}
        >
          {children}
        </Comp>
      </SuggestionsProvider>
    );
  },
);

export interface SuggestionItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  item: Suggestion;
  index: number;
  asChild?: boolean;
}

/** One suggestion. Only the active item is in the tab order. */
export const SuggestionItem = React.forwardRef<
  HTMLButtonElement,
  SuggestionItemProps
>(function SuggestionItem(
  { item, index, asChild = false, onClick, onFocus, children, ...rest },
  forwardedRef,
) {
  const { activeIndex, setActiveIndex, select, registerItem } =
    useSuggestionsContext("SuggestionItem");

  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      registerItem(index, node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [registerItem, index, forwardedRef],
  );

  const active = index === activeIndex;
  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={setRefs}
      type="button"
      tabIndex={active ? 0 : -1}
      data-handoff-slot="suggestion"
      data-active={active ? "" : undefined}
      onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);
        // Clicking straight into a later item should move the roving index
        // with it, or the next arrow press jumps somewhere unexpected.
        setActiveIndex(index);
      }}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        select(item);
      }}
      {...rest}
    >
      {children ?? item.label}
    </Comp>
  );
});
