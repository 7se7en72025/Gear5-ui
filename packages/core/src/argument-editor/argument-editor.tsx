import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";
import { safeStringify } from "../utils/format";

/** Values simple enough to edit in a single input. */
export type EditableValue = string | number | boolean;

export type ArgumentValues = Record<string, unknown>;

function isEditable(value: unknown): value is EditableValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

interface ArgumentEditorContextValue {
  values: ArgumentValues;
  original: ArgumentValues;
  keys: string[];
  setValue: (key: string, value: EditableValue) => void;
  reset: (key: string) => void;
  resetAll: () => void;
  isDirty: (key: string) => boolean;
  dirtyKeys: string[];
  disabled: boolean;
}

const [ArgumentEditorProvider, useArgumentEditorContext] =
  createContext<ArgumentEditorContextValue>("ArgumentEditor");

/** Read the current values and which of them have been edited. */
export function useArgumentEditor(): ArgumentEditorContextValue {
  return useArgumentEditorContext("useArgumentEditor");
}

export interface ArgumentEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Current values. Fully controlled, since the caller owns the tool call. */
  values: ArgumentValues;
  /**
   * What the model originally proposed. Used to mark edits and to reset.
   * Defaults to the first `values` seen.
   */
  original?: ArgumentValues;
  onChange?: (values: ArgumentValues) => void;
  /** Lock every field, e.g. once the call has been approved. */
  disabled?: boolean;
  asChild?: boolean;
}

/**
 * Edit what a tool is about to be called with, before approving it.
 *
 * Approval gives a person two options, yes and no, which is the wrong shape
 * for the most common case: the model got the intent right and one argument
 * wrong. Denying throws away a correct plan to fix a path. This lets the
 * argument be corrected in place, and keeps what the model proposed visible so
 * the person can see exactly what they changed.
 *
 * ```tsx
 * <ArgumentEditor values={args} onChange={setArgs}>
 *   <ArgumentFields>
 *     {Object.keys(args).map((key) => (
 *       <ArgumentField key={key} name={key} />
 *     ))}
 *   </ArgumentFields>
 *   <ArgumentEditorReset />
 * </ArgumentEditor>
 * ```
 */
export const ArgumentEditor = React.forwardRef<
  HTMLDivElement,
  ArgumentEditorProps
>(function ArgumentEditor(
  { values, original, onChange, disabled = false, asChild = false, children, ...rest },
  forwardedRef,
) {
  // Whatever arrived first is what the model proposed. Captured in a ref so a
  // later edit cannot quietly become the new baseline.
  const firstSeen = React.useRef(values);
  const baseline = original ?? firstSeen.current;

  const keys = React.useMemo(() => Object.keys(values), [values]);

  const setValue = React.useCallback(
    (key: string, value: EditableValue) => {
      if (disabled) return;
      onChange?.({ ...values, [key]: value });
    },
    [disabled, onChange, values],
  );

  const reset = React.useCallback(
    (key: string) => {
      if (disabled) return;
      onChange?.({ ...values, [key]: baseline[key] });
    },
    [disabled, onChange, values, baseline],
  );

  const resetAll = React.useCallback(() => {
    if (disabled) return;
    onChange?.({ ...baseline });
  }, [disabled, onChange, baseline]);

  const isDirty = React.useCallback(
    (key: string) => !Object.is(values[key], baseline[key]),
    [values, baseline],
  );

  const dirtyKeys = React.useMemo(
    () => keys.filter((key) => !Object.is(values[key], baseline[key])),
    [keys, values, baseline],
  );

  const Comp = resolveElement(asChild, "div");

  return (
    <ArgumentEditorProvider
      value={{
        values,
        original: baseline,
        keys,
        setValue,
        reset,
        resetAll,
        isDirty,
        dirtyKeys,
        disabled,
      }}
    >
      <Comp
        ref={forwardedRef}
        // A group rather than a form: this sits inside an Approval, and a
        // nested form would break the outer one's submit.
        role="group"
        data-handoff-part="argument-editor"
        data-dirty={dirtyKeys.length > 0 ? "" : undefined}
        {...rest}
      >
        {children}
        <span role="status" aria-live="polite" style={visuallyHidden}>
          {dirtyKeys.length > 0
            ? `${dirtyKeys.length} ${dirtyKeys.length === 1 ? "argument" : "arguments"} edited: ${dirtyKeys.join(", ")}.`
            : ""}
        </span>
      </Comp>
    </ArgumentEditorProvider>
  );
});

export interface ArgumentFieldsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const ArgumentFields = React.forwardRef<
  HTMLDivElement,
  ArgumentFieldsProps
>(function ArgumentFields({ asChild = false, ...rest }, forwardedRef) {
  const Comp = resolveElement(asChild, "div");
  return <Comp ref={forwardedRef} data-handoff-slot="fields" {...rest} />;
});

export interface ArgumentFieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Which argument this field edits. */
  name: string;
  /** Override the visible label. Defaults to the key. */
  label?: string;
  /** Render the control yourself. */
  children?: (context: {
    id: string;
    value: unknown;
    dirty: boolean;
    editable: boolean;
    setValue: (value: EditableValue) => void;
  }) => React.ReactNode;
  asChild?: boolean;
}

/**
 * One argument, as a labelled control.
 *
 * Nested objects and arrays are shown read only. Editing them well means a
 * JSON editor, and half a JSON editor is worse than an honest read only view.
 */
export const ArgumentField = React.forwardRef<HTMLDivElement, ArgumentFieldProps>(
  function ArgumentField({ name, label, children, asChild = false, ...rest }, forwardedRef) {
    const { values, original, setValue, reset, isDirty, disabled } =
      useArgumentEditorContext("ArgumentField");

    const reactId = React.useId();
    const inputId = `handoff-arg-${reactId}`;
    const noteId = `handoff-arg-${reactId}-note`;

    const value = values[name];
    const dirty = isDirty(name);
    const editable = isEditable(value);
    const Comp = resolveElement(asChild, "div");

    const commit = React.useCallback(
      (next: EditableValue) => setValue(name, next),
      [setValue, name],
    );

    return (
      <Comp
        ref={forwardedRef}
        data-handoff-part="argument-field"
        data-name={name}
        data-dirty={dirty ? "" : undefined}
        data-editable={editable ? "" : undefined}
        {...rest}
      >
        <label htmlFor={editable ? inputId : undefined} data-handoff-slot="arg-label">
          {label ?? name}
        </label>

        {children ? (
          children({ id: inputId, value, dirty, editable, setValue: commit })
        ) : editable ? (
          <ArgumentControl
            id={inputId}
            value={value}
            disabled={disabled}
            describedBy={dirty ? noteId : undefined}
            onCommit={commit}
          />
        ) : (
          <pre data-handoff-slot="arg-readonly">{safeStringify(value)}</pre>
        )}

        {dirty ? (
          <>
            {/* The original stays on screen. Without it people cannot tell
                what they changed, only that something is different. */}
            <span id={noteId} data-handoff-slot="arg-original">
              <span aria-hidden="true">{String(original[name])}</span>
              <span style={visuallyHidden}>
                {` Edited. The model proposed ${String(original[name])}.`}
              </span>
            </span>

            <button
              type="button"
              disabled={disabled}
              onClick={() => reset(name)}
              data-handoff-slot="arg-reset"
            >
              <span aria-hidden="true">Reset</span>
              <span style={visuallyHidden}>{`Reset ${label ?? name}`}</span>
            </button>
          </>
        ) : null}
      </Comp>
    );
  },
);

/** Picks the control that matches the value's type. */
function ArgumentControl({
  id,
  value,
  disabled,
  describedBy,
  onCommit,
}: {
  id: string;
  value: EditableValue;
  disabled: boolean;
  describedBy: string | undefined;
  onCommit: (value: EditableValue) => void;
}) {
  if (typeof value === "boolean") {
    return (
      <input
        id={id}
        type="checkbox"
        checked={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(event) => onCommit(event.target.checked)}
        data-handoff-slot="arg-input"
      />
    );
  }

  if (typeof value === "number") {
    return (
      <input
        id={id}
        type="number"
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          // An empty or half-typed number field reports NaN. Committing that
          // would replace the argument with something unsendable.
          if (Number.isNaN(next)) return;
          onCommit(next);
        }}
        data-handoff-slot="arg-input"
      />
    );
  }

  return (
    <input
      id={id}
      type="text"
      value={value}
      disabled={disabled}
      aria-describedby={describedBy}
      onChange={(event) => onCommit(event.target.value)}
      data-handoff-slot="arg-input"
    />
  );
}

export interface ArgumentEditorResetProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Put every argument back to what the model proposed. */
export const ArgumentEditorReset = React.forwardRef<
  HTMLButtonElement,
  ArgumentEditorResetProps
>(function ArgumentEditorReset(
  { asChild = false, onClick, children, ...rest },
  forwardedRef,
) {
  const { resetAll, dirtyKeys, disabled } =
    useArgumentEditorContext("ArgumentEditorReset");

  // Nothing to undo, so nothing to show.
  if (dirtyKeys.length === 0) return null;

  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      disabled={disabled}
      data-handoff-slot="reset-all"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        resetAll();
      }}
      {...rest}
    >
      {children ?? "Reset all"}
    </Comp>
  );
});
