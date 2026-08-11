import type * as React from "react";

/**
 * Hide content visually while keeping it available to screen readers.
 *
 * Inlined rather than shipped as a class so the package stays styling-free —
 * consumers should never have to import a stylesheet to get correct semantics.
 */
export const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
