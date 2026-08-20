"use client";

import * as React from "react";
import type { AttachmentFile, CheckpointRef, Suggestion } from "@gear5/core";
import { AttachmentList } from "@/registry/attachment";
import { EmptyState } from "@/registry/empty-state";
import { Feedback } from "@/registry/feedback";
import { Checkpoint } from "@/registry/checkpoint";
import { RunError } from "@/registry/run-error";
import { StreamingText } from "@/registry/streaming-text";
import { Suggestions } from "@/registry/suggestions";

/* -------------------------------------------------------------------------
 * Run error
 * ---------------------------------------------------------------------- */

const TRACE = [
  "TimeoutError: model call exceeded 60000ms",
  "    at callModel (src/agent/run.ts:88:11)",
  "    at async step (src/agent/loop.ts:41:5)",
  "    at async runAgent (src/agent/loop.ts:19:3)",
].join("\n");

export function RunErrorExample() {
  const [retrying, setRetrying] = React.useState(false);

  React.useEffect(() => {
    if (!retrying) return;
    const id = setTimeout(() => setRetrying(false), 2200);
    return () => clearTimeout(id);
  }, [retrying]);

  return (
    <RunError
      title="The run stopped"
      message="The model took longer than 60 seconds to respond. Nothing was written to disk."
      details={TRACE}
      retrying={retrying}
      onRetry={() => setRetrying(true)}
    />
  );
}

/* -------------------------------------------------------------------------
 * Streaming text
 * ---------------------------------------------------------------------- */

const ANSWER =
  "The retry helper rethrows on the first failure, so the loop never runs a second time. " +
  "Wrapping the call in a bounded loop and keeping the last error fixes it. " +
  "I have left the default at three attempts.";

export function StreamingTextExample() {
  const [count, setCount] = React.useState(ANSWER.length);
  const streaming = count < ANSWER.length;

  React.useEffect(() => {
    if (!streaming) return;
    const id = setTimeout(() => setCount((n) => Math.min(ANSWER.length, n + 2)), 26);
    return () => clearTimeout(id);
  }, [streaming, count]);

  return (
    <div className="space-y-3">
      <StreamingText text={ANSWER.slice(0, count)} streaming={streaming} />
      <button
        type="button"
        onClick={() => setCount(0)}
        className="text-xs text-fg-muted underline underline-offset-4 hover:text-fg"
      >
        Replay
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Suggestions
 * ---------------------------------------------------------------------- */

const PROMPTS: Suggestion[] = [
  { id: "1", label: "Explain the failure" },
  { id: "2", label: "Write a regression test" },
  { id: "3", label: "Roll back the deploy" },
  { id: "4", label: "Show me the diff" },
];

export function SuggestionsExample() {
  const [picked, setPicked] = React.useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Suggestions
        items={PROMPTS}
        label="Follow up prompts"
        onSelect={(value) => setPicked(value)}
      />
      <p className="text-xs text-fg-muted">
        {picked
          ? `Picked: "${picked}"`
          : "Tab once to enter, then arrow between them. Four chips, one tab stop."}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Checkpoint
 * ---------------------------------------------------------------------- */

const POINTS: CheckpointRef[] = [
  { id: "c1", label: "Before the migration", discards: 6 },
  { id: "c2", label: "After reading the schema", discards: 3 },
  { id: "c3", label: "Latest", discards: 0 },
];

export function CheckpointExample() {
  const [currentId, setCurrentId] = React.useState("c3");

  return (
    <div className="space-y-2">
      {POINTS.map((point) => (
        <Checkpoint
          key={point.id}
          checkpoint={point}
          current={point.id === currentId}
          onRestore={(p) => setCurrentId(p.id)}
        />
      ))}
      <p className="pt-1 text-xs text-fg-muted">
        Restoring discards the steps after it, so it takes two presses. Escape
        backs out.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Attachment
 * ---------------------------------------------------------------------- */

const INITIAL_FILES: AttachmentFile[] = [
  { id: "a1", name: "trace.json", size: 48_200, status: "ready" },
  {
    id: "a2",
    name: "screenshot.png",
    size: 1_240_000,
    status: "uploading",
    progress: 0.4,
  },
  {
    id: "a3",
    name: "core-dump.zip",
    size: 90_000_000,
    status: "error",
    error: "Too large",
  },
];

export function AttachmentExample() {
  const [files, setFiles] = React.useState(INITIAL_FILES);

  // Nudge the uploading chip along so the progress bar is not frozen.
  React.useEffect(() => {
    const id = setInterval(() => {
      setFiles((current) =>
        current.map((file) =>
          file.status === "uploading"
            ? {
                ...file,
                progress: ((file.progress ?? 0) + 0.08) % 1,
              }
            : file,
        ),
      );
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-3">
      <AttachmentList
        files={files}
        onRemove={(file) =>
          setFiles((current) => current.filter((f) => f.id !== file.id))
        }
      />
      {files.length === 0 ? (
        <button
          type="button"
          onClick={() => setFiles(INITIAL_FILES)}
          className="text-xs text-fg-muted underline underline-offset-4 hover:text-fg"
        >
          Add them back
        </button>
      ) : (
        <p className="text-xs text-fg-muted">
          Each remove button is named against its file, so a screen reader hears
          &ldquo;Remove trace.json&rdquo; instead of three identical buttons.
        </p>
      )}
    </div>
  );
}

export function FeedbackExample() {
  return (
    <div className="flex items-center gap-4 rounded-panel border border-line bg-panel-raised p-4">
      <p className="text-[14px] text-fg-muted">Was this response helpful?</p>
      <Feedback
        defaultRating={null}
        onRatingChange={(rating) => console.log("feedback:", rating)}
      />
    </div>
  );
}

export function EmptyStateExample() {
  return (
    <EmptyState
      title="No runs yet"
      description="Trigger the agent from the composer to see its trace here."
      action={
        <button
          type="button"
          className="rounded-chip bg-accent px-3.5 py-1.5 text-[13px] font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Start a run
        </button>
      }
    />
  );
}
