import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";
import { formatDuration } from "../utils/format";

interface RetryAfterContextValue {
  /** Milliseconds left, or 0 once the wait is over. Null before mount. */
  remaining: number | null;
  ready: boolean;
  retry: () => void;
  canRetry: boolean;
}

const [RetryAfterProvider, useRetryAfterContext] =
  createContext<RetryAfterContextValue>("RetryAfter");

/** Read the countdown and whether retrying is allowed yet. */
export function useRetryAfter(): RetryAfterContextValue {
  return useRetryAfterContext("useRetryAfter");
}

export interface RetryAfterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Epoch milliseconds when retrying becomes allowed. */
  until: number;
  onRetry?: () => void;
  /** Fired once when the countdown reaches zero. */
  onReady?: () => void;
  asChild?: boolean;
}

/**
 * A rate limited wait, with the retry gated until it expires.
 *
 * Providers hand back a retry-after and apps usually turn it into a toast that
 * says "try again later", which leaves the user poking a button that keeps
 * failing. Here the button is simply not available until it will work.
 *
 * ```tsx
 * <RetryAfter until={resetAt} onRetry={rerun}>
 *   <RetryAfterMessage />
 *   <RetryAfterButton />
 * </RetryAfter>
 * ```
 */
export const RetryAfter = React.forwardRef<HTMLDivElement, RetryAfterProps>(
  function RetryAfter(
    { until, onRetry, onReady, asChild = false, children, ...rest },
    forwardedRef,
  ) {
    // Null until mounted so server and client render the same markup. A live
    // countdown is the classic hydration mismatch.
    const [now, setNow] = React.useState<number | null>(null);

    React.useEffect(() => {
      setNow(Date.now());
      const id = setInterval(() => setNow(Date.now()), 250);
      return () => clearInterval(id);
    }, [until]);

    const remaining = now === null ? null : Math.max(0, until - now);
    const ready = remaining !== null && remaining <= 0;

    // Fire once. Read from a ref so an inline arrow does not re-arm the effect.
    const onReadyRef = React.useRef(onReady);
    React.useEffect(() => {
      onReadyRef.current = onReady;
    });
    const firedRef = React.useRef(false);
    React.useEffect(() => {
      if (!ready || firedRef.current) return;
      firedRef.current = true;
      onReadyRef.current?.();
    }, [ready]);

    // A new deadline means a new wait.
    React.useEffect(() => {
      firedRef.current = false;
    }, [until]);

    const retry = React.useCallback(() => {
      if (!ready) return;
      onRetry?.();
    }, [ready, onRetry]);

    const Comp = resolveElement(asChild, "div");

    return (
      <RetryAfterProvider
        value={{ remaining, ready, retry, canRetry: ready && Boolean(onRetry) }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="retry-after"
          data-ready={ready ? "" : undefined}
          {...rest}
        >
          {children}
          {/* Announced once it clears, rather than counting down out loud. */}
          <span role="status" aria-live="polite" style={visuallyHidden}>
            {ready ? "You can try again now." : ""}
          </span>
        </Comp>
      </RetryAfterProvider>
    );
  },
);

export interface RetryAfterMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Shown once the wait is over. */
  readyLabel?: React.ReactNode;
  asChild?: boolean;
}

/** How long is left. */
export const RetryAfterMessage = React.forwardRef<
  HTMLParagraphElement,
  RetryAfterMessageProps
>(function RetryAfterMessage(
  { asChild = false, children, readyLabel, ...rest },
  forwardedRef,
) {
  const { remaining, ready } = useRetryAfterContext("RetryAfterMessage");
  const Comp = resolveElement(asChild, "p");

  if (children !== undefined) {
    return (
      <Comp ref={forwardedRef} {...rest}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp ref={forwardedRef} data-handoff-slot="retry-message" {...rest}>
      {ready
        ? (readyLabel ?? "Ready to try again.")
        : remaining === null
          ? "Rate limited."
          : `Rate limited. Try again in ${formatDuration(remaining)}.`}
    </Comp>
  );
});

export interface RetryAfterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Retry. Disabled until the wait clears, so it never fails on purpose. */
export const RetryAfterButton = React.forwardRef<
  HTMLButtonElement,
  RetryAfterButtonProps
>(function RetryAfterButton(
  { asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { retry, ready, canRetry } = useRetryAfterContext("RetryAfterButton");
  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      disabled={!canRetry}
      data-handoff-slot="retry"
      data-ready={ready ? "" : undefined}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        retry();
      }}
      {...rest}
    >
      {children ?? "Try again"}
    </Comp>
  );
});
