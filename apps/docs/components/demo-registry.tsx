"use client";

import * as React from "react";
import {
  AgentStatusExample,
  ApprovalExample,
  BadgeExample,
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
  FeedbackExample,
  EmptyStateExample,
} from "./gallery-signals";
import { OnePieceBackground } from "@/registry/one-piece-background";
import {
  AgentHandoffExample,
  ContextListExample,
  ModelPickerExample,
  RetryAfterExample,
  RunControlsExample,
  ToolPermissionExample,
} from "./gallery-control";

function OnePieceBackgroundExample() {
  return (
    <div className="overflow-hidden rounded-panel border border-line">
      <OnePieceBackground className="h-[360px]">
        <div className="flex h-[360px] flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-2xl font-semibold">Grand Line Awaits</p>
          <p className="mt-2 text-sm text-white/80">
            Sample content over the animated background
          </p>
        </div>
      </OnePieceBackground>
    </div>
  );
}

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
  "one-piece-background": OnePieceBackgroundExample,
  feedback: FeedbackExample,
  "empty-state": EmptyStateExample,
  badge: BadgeExample,
  "model-picker": ModelPickerExample,
};

export function Demo({ slug }: { slug: string }) {
  const Component = DEMOS[slug];
  if (!Component) return null;
  return <Component />;
}

export function hasDemo(slug: string): boolean {
  return slug in DEMOS;
}
