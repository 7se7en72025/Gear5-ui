import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";
import { visuallyHidden } from "../utils/visually-hidden";

export type FeedbackRating = "up" | "down" | null;

interface FeedbackContextValue {
  rating: FeedbackRating;
  setRating: (rating: FeedbackRating) => void;
  disabled: boolean;
}

const [FeedbackProvider, useFeedbackContext] =
  createContext<FeedbackContextValue>("Feedback");

export interface FeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  rating?: FeedbackRating;
  defaultRating?: FeedbackRating;
  onRatingChange?: (rating: FeedbackRating) => void;
  disabled?: boolean;
  asChild?: boolean;
}

/**
 * A rating on one message, not a form. Picking the same value again clears
 * it — the honest state for "I did not mean to click that" is unset, not
 * stuck between two answers you no longer hold.
 *
 * ```tsx
 * <Feedback onRatingChange={(r) => log(messageId, r)}>
 *   <FeedbackButton value="up" />
 *   <FeedbackButton value="down" />
 * </Feedback>
 * ```
 */
export const Feedback = React.forwardRef<HTMLDivElement, FeedbackProps>(
  function Feedback(
    {
      rating: ratingProp,
      defaultRating = null,
      onRatingChange,
      disabled = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const [rating, setRatingState] = useControllableState<FeedbackRating>({
      prop: ratingProp,
      defaultProp: defaultRating,
      onChange: onRatingChange,
    });

    // Read the live value through a ref so the callback's identity stays
    // stable — consumers pass this straight to onClick on every render.
    const ratingRef = React.useRef(rating);
    ratingRef.current = rating;

    const setRating = React.useCallback(
      (next: FeedbackRating) => {
        if (disabled) return;
        setRatingState(ratingRef.current === next ? null : next);
      },
      [disabled, setRatingState],
    );

    const Comp = resolveElement(asChild, "div");

    return (
      <FeedbackProvider value={{ rating: rating ?? null, setRating, disabled }}>
        <Comp
          ref={forwardedRef}
          role="group"
          aria-label="Rate this response"
          data-handoff-part="feedback"
          {...rest}
        >
          {children}
          <span role="status" aria-live="polite" style={visuallyHidden}>
            {rating === "up"
              ? "Marked helpful."
              : rating === "down"
                ? "Marked not helpful."
                : ""}
          </span>
        </Comp>
      </FeedbackProvider>
    );
  },
);

export interface FeedbackButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: "up" | "down";
  asChild?: boolean;
}

export const FeedbackButton = React.forwardRef<
  HTMLButtonElement,
  FeedbackButtonProps
>(function FeedbackButton(
  { value, asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { rating, setRating, disabled } = useFeedbackContext("FeedbackButton");
  const pressed = rating === value;
  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={value === "up" ? "Helpful" : "Not helpful"}
      data-handoff-slot="feedback-button"
      data-value={value}
      data-pressed={pressed ? "" : undefined}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setRating(value);
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
});
