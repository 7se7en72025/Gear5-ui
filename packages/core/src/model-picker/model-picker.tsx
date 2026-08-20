import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useComposedRefs } from "../utils/compose-refs";
import { useControllableState } from "../utils/use-controllable-state";

export interface ModelOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface ModelPickerContextValue {
  value: string | undefined;
  setValue: (value: string) => void;
  options: ModelOption[];
  open: boolean;
  setOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const [ModelPickerProvider, useModelPickerContext] =
  createContext<ModelPickerContextValue>("ModelPicker");

export interface ModelPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  options: ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  asChild?: boolean;
}

/**
 * A listbox, not a native select — the option needs a description line under
 * the label, and a native select cannot render one.
 *
 * ```tsx
 * <ModelPicker options={models} value={model} onValueChange={setModel}>
 *   <ModelPickerTrigger />
 *   <ModelPickerList />
 * </ModelPicker>
 * ```
 */
export const ModelPicker = React.forwardRef<HTMLDivElement, ModelPickerProps>(
  function ModelPicker(
    {
      options,
      value: valueProp,
      defaultValue,
      onValueChange,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, containerRef);

    React.useEffect(() => {
      if (!open) return;
      const onPointerDown = (event: PointerEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    const Comp = resolveElement(asChild, "div");

    return (
      <ModelPickerProvider
        value={{
          value,
          setValue: (next) => setValue(next),
          options,
          open,
          setOpen,
          activeIndex,
          setActiveIndex,
        }}
      >
        <Comp
          ref={ref}
          data-handoff-part="model-picker"
          {...rest}
        >
          {children}
        </Comp>
      </ModelPickerProvider>
    );
  },
);

export interface ModelPickerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const ModelPickerTrigger = React.forwardRef<
  HTMLButtonElement,
  ModelPickerTriggerProps
>(function ModelPickerTrigger(
  { asChild = false, onClick, onKeyDown, children, ...rest },
  forwardedRef,
) {
  const { value, options, open, setOpen } =
    useModelPickerContext("ModelPickerTrigger");
  const selected = options.find((o) => o.value === value);
  const Comp = resolveElement(asChild, "button");

  return (
    <Comp
      ref={forwardedRef}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      data-handoff-slot="model-picker-trigger"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setOpen(!open);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      }}
      {...rest}
    >
      {/*
       * The label always tracks context, controlled or not — a consumer
       * cannot pass a static label as children, because there is nothing
       * static to pass; only the current selection knows what it should say.
       * `children` is for trailing decoration, like a chevron, not a
       * replacement for it.
       */}
      {selected?.label ?? "Select a model"}
      {children}
    </Comp>
  );
});

export interface ModelPickerListProps
  extends React.HTMLAttributes<HTMLUListElement> {
  asChild?: boolean;
}

export const ModelPickerList = React.forwardRef<
  HTMLUListElement,
  ModelPickerListProps
>(function ModelPickerList({ asChild = false, onKeyDown, ...rest }, forwardedRef) {
  const {
    options,
    value,
    setValue,
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
  } = useModelPickerContext("ModelPickerList");
  const Comp = resolveElement(asChild, "ul");

  if (!open) return null;

  const enabledIndices = options
    .map((o, i) => (o.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const move = (delta: number) => {
    const pos = enabledIndices.indexOf(activeIndex);
    const nextPos =
      pos === -1
        ? 0
        : (pos + delta + enabledIndices.length) % enabledIndices.length;
    setActiveIndex(enabledIndices[nextPos] ?? 0);
  };

  return (
    <Comp
      ref={forwardedRef}
      role="listbox"
      data-handoff-slot="model-picker-list"
      onKeyDown={(event: React.KeyboardEvent<HTMLUListElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        } else if (event.key === "Enter") {
          event.preventDefault();
          const option = options[activeIndex];
          if (option && !option.disabled) {
            setValue(option.value);
            setOpen(false);
          }
        } else if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
        }
      }}
      {...rest}
    >
      {options.map((option, index) => (
        <li
          key={option.value}
          role="option"
          aria-selected={option.value === value}
          aria-disabled={option.disabled}
          data-handoff-slot="model-picker-option"
          data-selected={option.value === value ? "" : undefined}
          data-active={index === activeIndex ? "" : undefined}
          data-disabled={option.disabled ? "" : undefined}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => {
            if (option.disabled) return;
            setValue(option.value);
            setOpen(false);
          }}
        >
          <span data-handoff-slot="model-picker-option-label">
            {option.label}
          </span>
          {option.description ? (
            <span data-handoff-slot="model-picker-option-description">
              {option.description}
            </span>
          ) : null}
        </li>
      ))}
    </Comp>
  );
});
