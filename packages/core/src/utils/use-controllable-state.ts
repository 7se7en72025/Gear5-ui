import * as React from "react";

interface UseControllableStateParams<T> {
  /** When provided, the component is controlled and never owns the value. */
  prop?: T | undefined;
  defaultProp?: T | undefined;
  onChange?: (value: T) => void;
}

/**
 * Lets a primitive work controlled or uncontrolled from the same call site,
 * which is what makes `open` / `defaultOpen` pairs behave the way consumers
 * expect from Radix-style APIs.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T | undefined, (next: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  // Keep the latest callback without making `setValue` change identity, so
  // consumers can safely pass an inline arrow function.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [value, setValue];
}
