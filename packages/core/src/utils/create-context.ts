import * as React from "react";

/**
 * Context factory that fails loudly instead of silently rendering nothing.
 *
 * Compound components break in confusing ways when a part is used outside its
 * root, so the error names both the part and the root it needs.
 */
export function createContext<T>(rootName: string) {
  const Context = React.createContext<T | null>(null);
  Context.displayName = rootName;

  function useScopedContext(consumerName: string): T {
    const context = React.useContext(Context);
    if (context === null) {
      throw new Error(
        `[handoff-ui] \`${consumerName}\` must be rendered inside \`${rootName}\`.`,
      );
    }
    return context;
  }

  return [Context.Provider, useScopedContext] as const;
}
