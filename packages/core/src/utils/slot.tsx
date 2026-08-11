import * as React from "react";
import { composeRefs } from "./compose-refs";

/**
 * `asChild` support: render into the caller's element instead of our own.
 *
 * Every Handoff primitive accepts `asChild` so consumers can swap the rendered
 * tag — a `<button>` for a link, a `<div>` for their own styled component —
 * without losing the behaviour and ARIA wiring the primitive provides.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const REACT_MAJOR = Number.parseInt(React.version, 10);

/**
 * React 19 exposes `ref` as an ordinary prop; React 18 keeps it on the element
 * and warns if you read `props.ref`. Branch on version rather than probing.
 */
function getElementRef(element: React.ReactElement): React.Ref<unknown> | undefined {
  if (REACT_MAJOR >= 19) {
    return (element.props as { ref?: React.Ref<unknown> }).ref;
  }
  return (element as unknown as { ref?: React.Ref<unknown> }).ref;
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    const isHandler = /^on[A-Z]/.test(key);

    if (isHandler) {
      // Both handlers run, child first so it can call preventDefault and have
      // our internal handler observe it.
      if (typeof slotValue === "function" && typeof childValue === "function") {
        merged[key] = (...args: unknown[]) => {
          (childValue as (...a: unknown[]) => unknown)(...args);
          (slotValue as (...a: unknown[]) => unknown)(...args);
        };
      } else if (typeof slotValue === "function") {
        merged[key] = slotValue;
      }
      continue;
    }

    if (key === "style") {
      merged[key] = {
        ...(slotValue as React.CSSProperties),
        ...(childValue as React.CSSProperties),
      };
    } else if (key === "className") {
      merged[key] = [slotValue, childValue].filter(Boolean).join(" ");
    } else {
      merged[key] = slotValue;
    }
  }

  return merged;
}

/**
 * Pick the element a primitive renders, given its `asChild` prop.
 *
 * The obvious `asChild ? Slot : "div"` produces a union with incompatible ref
 * types: TypeScript cannot see that a `Ref<HTMLDivElement>` is safe to hand to
 * `Slot`, which is typed against the generic `HTMLElement`. Containing the cast
 * here keeps every call site fully prop-checked against its own tag, instead of
 * sprinkling `any` through the components.
 */
export function resolveElement<T extends React.ElementType>(
  asChild: boolean,
  tag: T,
): T {
  return asChild ? (Slot as unknown as T) : tag;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  function Slot(props, forwardedRef) {
    const { children, ...slotProps } = props;

    if (!React.isValidElement(children)) {
      if (process.env.NODE_ENV !== "production" && children != null) {
        console.warn(
          "[handoff-ui] `asChild` expects a single React element child. " +
            "Received a non-element, so the props were dropped.",
        );
      }
      return null;
    }

    const childRef = getElementRef(children);

    return React.cloneElement(children, {
      ...mergeProps(
        slotProps as Record<string, unknown>,
        children.props as Record<string, unknown>,
      ),
      ref: composeRefs(forwardedRef, childRef as React.Ref<HTMLElement>),
    } as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> });
  },
);
