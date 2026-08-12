import * as React from "react";
import type { RunControlState } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

export type RunAction = "pause" | "resume" | "stop" | "step";

interface RunControlsContextValue {
  state: RunControlState;
  can: (action: RunAction) => boolean;
  dispatch: (action: RunAction) => void;
  labelId: string;
}

const [RunControlsProvider, useRunControlsContext] =
  createContext<RunControlsContextValue>("RunControls");

/** Read the run state and which actions are currently legal. */
export function useRunControls(): RunControlsContextValue {
  return useRunControlsContext("useRunControls");
}

/**
 * Which actions make sense in each state.
 *
 * Kept as a table rather than scattered conditionals so the rules are visible
 * in one place and a new state cannot silently enable the wrong button.
 */
const ALLOWED: Record<RunControlState, RunAction[]> = {
  idle: [],
  running: ["pause", "stop"],
  paused: ["resume", "stop", "step"],
  stopped: [],
};

export interface RunControlsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state: RunControlState;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  /** Advance exactly one step while paused. */
  onStep?: () => void;
  label?: string;
  /**
   * Bind Space to pause and resume while the group has focus.
   *
   * Off by default. Space is the button activation key, so binding it at the
   * group level would fire twice when a button inside is focused.
   */
  keyboardShortcuts?: boolean;
  asChild?: boolean;
}

/**
 * Pause, resume, step, and stop a run.
 *
 * Long agent runs need a brake. The tricky part is that most of these actions
 * are illegal most of the time, and a row of buttons that look clickable but do
 * nothing is worse than not having them.
 *
 * ```tsx
 * <RunControls state={state} onPause={pause} onResume={resume} onStop={stop}>
 *   <RunControlButton action="pause" />
 *   <RunControlButton action="resume" />
 *   <RunControlButton action="stop" />
 * </RunControls>
 * ```
 */
export const RunControls = React.forwardRef<HTMLDivElement, RunControlsProps>(
  function RunControls(
    {
      state,
      onPause,
      onResume,
      onStop,
      onStep,
      label = "Run controls",
      keyboardShortcuts = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const labelId = `handoff-controls-${reactId}-label`;

    const handlers: Record<RunAction, (() => void) | undefined> = {
      pause: onPause,
      resume: onResume,
      stop: onStop,
      step: onStep,
    };

    const can = React.useCallback(
      (action: RunAction) =>
        ALLOWED[state].includes(action) && Boolean(handlers[action]),
      // Handlers are read fresh on each render, which is what we want here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state, onPause, onResume, onStop, onStep],
    );

    const dispatch = React.useCallback(
      (action: RunAction) => {
        if (!can(action)) return;
        handlers[action]?.();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [can, onPause, onResume, onStop, onStep],
    );

    const Comp = resolveElement(asChild, "div");

    return (
      <RunControlsProvider value={{ state, can, dispatch, labelId }}>
        <Comp
          ref={forwardedRef}
          role="group"
          aria-labelledby={labelId}
          data-handoff-part="run-controls"
          data-state={state}
          onKeyDown={
            keyboardShortcuts
              ? (event: React.KeyboardEvent<HTMLDivElement>) => {
                  if (event.key !== " " || event.target !== event.currentTarget) {
                    return;
                  }
                  event.preventDefault();
                  dispatch(state === "running" ? "pause" : "resume");
                }
              : undefined
          }
          {...rest}
        >
          <span id={labelId} style={visuallyHidden}>
            {label}
          </span>
          {children}
          <RunStateAnnouncer state={state} />
        </Comp>
      </RunControlsProvider>
    );
  },
);

const STATE_MESSAGE: Record<RunControlState, string> = {
  idle: "",
  running: "Run resumed.",
  paused: "Run paused.",
  stopped: "Run stopped.",
};

/**
 * Pausing changes nothing visible except a button label, so the state change
 * is stated outright.
 */
function RunStateAnnouncer({ state }: { state: RunControlState }) {
  const previous = React.useRef<RunControlState | null>(null);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const prior = previous.current;
    previous.current = state;
    if (prior === null || prior === state) return;
    setMessage(STATE_MESSAGE[state]);
  }, [state]);

  return (
    <span role="status" aria-live="polite" style={visuallyHidden}>
      {message}
    </span>
  );
}

const ACTION_LABEL: Record<RunAction, string> = {
  pause: "Pause",
  resume: "Resume",
  stop: "Stop",
  step: "Step",
};

export interface RunControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: RunAction;
  /**
   * Render the button even when the action is illegal, disabled rather than
   * absent. Useful when a fixed layout matters more than a tidy row.
   */
  keepMounted?: boolean;
  asChild?: boolean;
}

/** One control. Absent when its action is not currently legal. */
export const RunControlButton = React.forwardRef<
  HTMLButtonElement,
  RunControlButtonProps
>(function RunControlButton(
  { action, keepMounted = false, asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { can, dispatch } = useRunControlsContext("RunControlButton");
  const allowed = can(action);

  if (!allowed && !keepMounted) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      disabled={!allowed}
      data-handoff-slot={action}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        dispatch(action);
      }}
      {...rest}
    >
      {children ?? ACTION_LABEL[action]}
    </Comp>
  );
});
