"use client";

import * as React from "react";
import type { Suggestion } from "handoff-ui";
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
