import * as React from "react";
import type { CheckpointRef } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

interface CheckpointContextValue {
  checkpoint: CheckpointRef;
  /** True when this is the state the run is currently at. */
  current: boolean;
  confirming: boolean;
  restore: () => void;
  cancel: () => void;
  labelId: string;
}

const [CheckpointProvider, useCheckpointContext] =
  createContext<CheckpointContextValue>("Checkpoint");

/** Read the checkpoint and whether a restore is armed. */
export function useCheckpoint(): CheckpointContextValue {
  return useCheckpointContext("useCheckpoint");
}

export interface CheckpointProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  checkpoint: CheckpointRef;
  /** True when the run is already at this point. */
  current?: boolean;
  onRestore?: (checkpoint: CheckpointRef) => void;
  /**
   * Require a second press before restoring. On by default, because restoring
   * throws away every step that came after it.
   */
  requireConfirm?: boolean;
  asChild?: boolean;
}

/**
 * A point in the run you can rewind to.
 *
 * Restoring is destructive in a way that is easy to miss: everything after the
 * checkpoint goes away. So it is treated like the approval, with a confirm step
 * and a spoken count of what is about to be discarded.
 *
 * ```tsx
 * <Checkpoint checkpoint={point} onRestore={rewind}>
 *   <CheckpointLabel />
 *   <CheckpointRestore />
 * </Checkpoint>
 * ```
 */
export const Checkpoint = React.forwardRef<HTMLDivElement, CheckpointProps>(
  function Checkpoint(
    {
      checkpoint,
      current = false,
      onRestore,
      requireConfirm = true,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const labelId = `handoff-checkpoint-${reactId}-label`;
    const [confirming, setConfirming] = React.useState(false);

    // Arriving at this checkpoint makes a pending confirm meaningless.
    React.useEffect(() => {
      if (current) setConfirming(false);
    }, [current]);

    const restore = React.useCallback(() => {
      if (current) return;
      if (requireConfirm && !confirming) {
        setConfirming(true);
        return;
      }
      setConfirming(false);
      onRestore?.(checkpoint);
    }, [current, requireConfirm, confirming, onRestore, checkpoint]);

    const cancel = React.useCallback(() => setConfirming(false), []);

    const Comp = resolveElement(asChild, "div");

    return (
      <CheckpointProvider
        value={{ checkpoint, current, confirming, restore, cancel, labelId }}
      >
        <Comp
          ref={forwardedRef}
          data-handoff-part="checkpoint"
          data-current={current ? "" : undefined}
          data-confirming={confirming ? "" : undefined}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Escape" && confirming) {
              event.stopPropagation();
              cancel();
            }
          }}
          {...rest}
        >
          {children}
        </Comp>
      </CheckpointProvider>
    );
  },
);

export interface CheckpointLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

export const CheckpointLabel = React.forwardRef<
  HTMLSpanElement,
  CheckpointLabelProps
>(function CheckpointLabel({ asChild = false, children, ...rest }, forwardedRef) {
  const { checkpoint, labelId, current } = useCheckpointContext("CheckpointLabel");
  const Comp = resolveElement(asChild, "span");

  return (
    <Comp ref={forwardedRef} id={labelId} {...rest}>
      {children ?? checkpoint.label}
      {current ? <span style={visuallyHidden}> (current state)</span> : null}
    </Comp>
  );
});

export interface CheckpointDiscardCountProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * How much restoring would throw away.
 *
 * The single most important number on the control, and the one people are most
 * likely to miss, so it is stated in words rather than left as a bare digit.
 */
export const CheckpointDiscardCount = React.forwardRef<
  HTMLSpanElement,
  CheckpointDiscardCountProps
>(function CheckpointDiscardCount({ asChild = false, ...rest }, forwardedRef) {
  const { checkpoint, current } = useCheckpointContext("CheckpointDiscardCount");
  const count = checkpoint.discards ?? 0;
  if (current || count <= 0) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} data-handoff-slot="discards" {...rest}>
      <span aria-hidden="true">{`-${count}`}</span>
      <span style={visuallyHidden}>
        {`Discards ${count} later ${count === 1 ? "step" : "steps"}`}
      </span>
    </Comp>
  );
});

export interface CheckpointRestoreProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  confirmLabel?: React.ReactNode;
  currentLabel?: React.ReactNode;
  asChild?: boolean;
}

/** Rewind here. Two presses unless the caller opted out. */
export const CheckpointRestore = React.forwardRef<
  HTMLButtonElement,
  CheckpointRestoreProps
>(function CheckpointRestore(
  { asChild = false, onClick, children, confirmLabel, currentLabel, ...rest },
  forwardedRef,
) {
  const { restore, confirming, current, checkpoint, labelId } =
    useCheckpointContext("CheckpointRestore");

  const selfId = React.useId();
  const Comp = resolveElement(asChild, "button");
  const count = checkpoint.discards ?? 0;

  const label = current
    ? (currentLabel ?? "Current")
    : confirming
      ? (confirmLabel ?? "Confirm")
      : (children ?? "Restore");

  return (
    <Comp
      ref={forwardedRef}
      id={selfId}
      type="button"
      disabled={current}
      // Own text first, then the checkpoint name, so it reads "Restore, First
      // draft" instead of a list of identical "Restore" buttons.
      aria-labelledby={`${selfId} ${labelId}`}
      data-handoff-slot="restore"
      data-confirming={confirming ? "" : undefined}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        restore();
      }}
      {...rest}
    >
      {label}
      {confirming && count > 0 ? (
        <span style={visuallyHidden}>
          {` Press again to discard ${count} later ${count === 1 ? "step" : "steps"}.`}
        </span>
      ) : null}
    </Comp>
  );
});
