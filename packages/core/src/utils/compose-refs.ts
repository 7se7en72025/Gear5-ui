import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function assignRef<T>(ref: PossibleRef<T>, value: T): (() => void) | undefined {
  if (typeof ref === "function") {
    const cleanup = ref(value);
    // React 19 lets ref callbacks return a cleanup function. Older versions
    // return undefined, and some callers return an unrelated value, so only
    // treat an actual function as a cleanup.
    return typeof cleanup === "function" ? cleanup : undefined;
  }
  if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
  return undefined;
}

/** Point several refs at the same node. */
export function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => assignRef(ref, node));

    if (cleanups.some(Boolean)) {
      return () => {
        for (const [index, cleanup] of cleanups.entries()) {
          if (cleanup) {
            cleanup();
          } else {
            assignRef(refs[index], null as T);
          }
        }
      };
    }
    return undefined;
  };
}

/** Memoized {@link composeRefs} for use inside components. */
export function useComposedRefs<T>(
  ...refs: PossibleRef<T>[]
): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs is a spread, compared positionally
  return React.useCallback(composeRefs(...refs), refs);
}
