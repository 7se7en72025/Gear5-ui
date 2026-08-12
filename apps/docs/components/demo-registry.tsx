"use client";

import * as React from "react";
import {
  AgentStatusExample,
  ApprovalExample,
  DiffExample,
  ReasoningExample,
  RunTimelineExample,
  TaskListExample,
  ToolCallExample,
  UsageMeterExample,
} from "./component-gallery";
import {
  ArtifactExample,
  CitationExample,
  CodeBlockExample,
  ComposerExample,
  LogStreamExample,
} from "./gallery-agentic";
import {
  RunErrorExample,
  StreamingTextExample,
  SuggestionsExample,
  CheckpointExample,
  AttachmentExample,
} from "./gallery-signals";
import {
  AgentHandoffExample,
  ContextListExample,
  RetryAfterExample,
  RunControlsExample,
  ToolPermissionExample,
} from "./gallery-control";

/**
 * Slug to demo. Kept apart from the catalog so the metadata stays importable
 * from server components, which cannot pull in anything that renders state.
 */
const DEMOS: Record<string, React.ComponentType> = {
  approval: ApprovalExample,
  "tool-call": ToolCallExample,
  reasoning: ReasoningExample,
  diff: DiffExample,
  "log-stream": LogStreamExample,
  artifact: ArtifactExample,
  "code-block": CodeBlockExample,
  citation: CitationExample,
  composer: ComposerExample,
  "run-timeline": RunTimelineExample,
  "task-list": TaskListExample,
  "agent-status": AgentStatusExample,
  "usage-meter": UsageMeterExample,
  "run-error": RunErrorExample,
  "streaming-text": StreamingTextExample,
  suggestions: SuggestionsExample,
  checkpoint: CheckpointExample,
  attachment: AttachmentExample,
  "run-controls": RunControlsExample,
  "tool-permission": ToolPermissionExample,
  "context-list": ContextListExample,
  "agent-handoff": AgentHandoffExample,
  "retry-after": RetryAfterExample,
};

export function Demo({ slug }: { slug: string }) {
  const Component = DEMOS[slug];
  if (!Component) return null;
  return <Component />;
}

export function hasDemo(slug: string): boolean {
  return slug in DEMOS;
}
