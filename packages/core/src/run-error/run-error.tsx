import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";

interface RunErrorContextValue {
  title: string;
  message: string | undefined;
  details: string | undefined;
  retrying: boolean;
  canRetry: boolean;
  retry: () => void;
  detailsOpen: boolean;
  setDetailsOpen: (open: boolean) => void;
  titleId: string;
  detailsId: string;
}

const [RunErrorProvider, useRunErrorContext] =
  createContext<RunErrorContextValue>("RunError");

/** Read the failure and whether a retry is in flight. */
export function useRunError(): RunErrorContextValue {
  return useRunErrorContext("useRunError");
}

export interface RunErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short summary, e.g. "The run stopped". */
  title?: string;
  /** What went wrong, in words the user can act on. */
  message?: string;
  /** Stack trace or raw payload, hidden behind a disclosure. */
  details?: string;
  onRetry?: () => void;
  /** True while a retry is running. Disables the button. */
  retrying?: boolean;
  detailsOpen?: boolean;
  defaultDetailsOpen?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
  asChild?: boolean;
}

/**
 * A run that failed.
 *
 * Agent runs fail constantly, for reasons ranging from a timeout to a bad tool
 * argument, and the usual treatment is a red toast that vanishes before anyone
 * reads it. This keeps the failure on screen, next to the retry.
 *
 * ```tsx
 * <RunError
 *   title="The run stopped"
 *   message="The model timed out after 60 seconds."
 *   details={stack}
 *   onRetry={rerun}
 * >
 *   <RunErrorTitle />
 *   <RunErrorMessage />
 *   <RunErrorDetails />
 *   <RunErrorRetry />
 * </RunError>
 * ```
 */
export const RunError = React.forwardRef<HTMLDivElement, RunErrorProps>(
  function RunError(
    {
      title = "Something went wrong",
      message,
      details,
      onRetry,
      retrying = false,
      detailsOpen: detailsOpenProp,
      defaultDetailsOpen = false,
      onDetailsOpenChange,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const titleId = `handoff-error-${reactId}-title`;
    const detailsId = `handoff-error-${reactId}-details`;

    const [detailsOpen = false, setDetailsOpen] = useControllableState({
      prop: detailsOpenProp,
      defaultProp: defaultDetailsOpen,
      onChange: onDetailsOpenChange,
    });

    const canRetry = Boolean(onRetry) && !retrying;
    const retry = React.useCallback(() => {
      if (!canRetry) return;
      onRetry?.();
    }, [canRetry, onRetry]);

    const Comp = resolveElement(asChild, "div");

    return (
      <RunErrorProvider
        value={{
          title,
          message,
          details,
          retrying,
          canRetry,
          retry,
          detailsOpen,
          setDetailsOpen,
          titleId,
          detailsId,
        }}
      >
        <Comp
          ref={forwardedRef}
          // alert, so it is announced the moment it appears. A failure that
          // scrolled past silently is a failure the user never learns about.
          role="alert"
          aria-labelledby={titleId}
          data-handoff-part="run-error"
          data-retrying={retrying ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </RunErrorProvider>
    );
  },
);

export interface RunErrorTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const RunErrorTitle = React.forwardRef<HTMLDivElement, RunErrorTitleProps>(
  function RunErrorTitle({ asChild = false, children, ...rest }, forwardedRef) {
    const { title, titleId } = useRunErrorContext("RunErrorTitle");
    const Comp = resolveElement(asChild, "div");
    return (
      <Comp ref={forwardedRef} id={titleId} {...rest}>
        {children ?? title}
      </Comp>
    );
  },
);

export interface RunErrorMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

export const RunErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  RunErrorMessageProps
>(function RunErrorMessage({ asChild = false, children, ...rest }, forwardedRef) {
  const { message } = useRunErrorContext("RunErrorMessage");
  if (!message && children === undefined) return null;

  const Comp = resolveElement(asChild, "p");
  return (
    <Comp ref={forwardedRef} {...rest}>
      {children ?? message}
    </Comp>
  );
});

export interface RunErrorDetailsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Label on the toggle. */
  label?: React.ReactNode;
  asChild?: boolean;
}

/**
 * The stack trace, collapsed.
 *
 * Kept out of the alert's first read: screen reader users would otherwise hear
 * an entire stack trace before the sentence explaining what broke.
 */
export const RunErrorDetails = React.forwardRef<
  HTMLDivElement,
  RunErrorDetailsProps
>(function RunErrorDetails({ label, asChild = false, ...rest }, forwardedRef) {
  const { details, detailsOpen, setDetailsOpen, detailsId } =
    useRunErrorContext("RunErrorDetails");
  if (!details) return null;

  const Comp = resolveElement(asChild, "div");

  return (
    <Comp ref={forwardedRef} data-handoff-slot="error-details" {...rest}>
      <button
        type="button"
        aria-expanded={detailsOpen}
        aria-controls={detailsId}
        onClick={() => setDetailsOpen(!detailsOpen)}
        data-state={detailsOpen ? "open" : "closed"}
      >
        {label ?? (detailsOpen ? "Hide details" : "Show details")}
      </button>

      {detailsOpen ? (
        <pre id={detailsId} data-handoff-slot="error-trace">
          {details}
        </pre>
      ) : null}
    </Comp>
  );
});

export interface RunErrorRetryProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  retryingLabel?: React.ReactNode;
  asChild?: boolean;
}

/** Run it again. Absent when the caller gave no retry handler. */
export const RunErrorRetry = React.forwardRef<
  HTMLButtonElement,
  RunErrorRetryProps
>(function RunErrorRetry(
  { asChild = false, onClick, children, retryingLabel, ...rest },
  forwardedRef,
) {
  const { retry, canRetry, retrying } = useRunErrorContext("RunErrorRetry");
  if (!canRetry && !retrying) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      disabled={!canRetry}
      data-handoff-slot="retry"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        retry();
      }}
      {...rest}
    >
      {retrying ? (retryingLabel ?? "Retrying") : (children ?? "Try again")}
    </Comp>
  );
});
