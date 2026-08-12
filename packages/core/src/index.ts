"use client";

/**
 * handoff-ui — headless, accessible React primitives for agent apps.
 *
 * Nothing here renders styles. Compose these primitives yourself, or install
 * the styled versions with `npx shadcn@latest add`.
 *
 * Every primitive here is interactive, so this entry is a client boundary. The
 * `adapters/*` entries stay free of the directive and run in Server Components.
 */

export * from "./types";

export * from "./approval";
export * from "./tool-call";
export * from "./reasoning";
export * from "./run-timeline";
export * from "./task-list";
export * from "./agent-status";
export * from "./diff";
export * from "./usage-meter";
export * from "./log-stream";
export * from "./citation";
export * from "./artifact";
export * from "./composer";
export * from "./code-block";
export * from "./run-error";
export * from "./streaming-text";
export * from "./suggestions";
export * from "./checkpoint";
export * from "./attachment";

// Escape hatches for building your own primitives on the same foundation.
export { Slot, resolveElement } from "./utils/slot";
export type { SlotProps } from "./utils/slot";
export { composeRefs, useComposedRefs } from "./utils/compose-refs";
export { useControllableState } from "./utils/use-controllable-state";
export { useElapsed } from "./utils/use-elapsed";
export { useStickToBottom } from "./utils/use-stick-to-bottom";
export type {
  UseStickToBottomOptions,
  StickToBottom,
} from "./utils/use-stick-to-bottom";
export { visuallyHidden } from "./utils/visually-hidden";
export { diffLines } from "./utils/diff";
export type { DiffLine, DiffLineType, DiffResult } from "./utils/diff";
export { parseAnsi, stripAnsi } from "./utils/ansi";
export type { AnsiSegment } from "./utils/ansi";
export {
  formatDuration,
  formatBytes,
  formatTokens,
  formatCost,
  safeStringify,
} from "./utils/format";
