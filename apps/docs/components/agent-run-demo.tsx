"use client";

import * as React from "react";
import type { AgentRunStatus, TaskItem } from "handoff-ui";
import { AgentStatus } from "@/registry/agent-status";
import { Approval } from "@/registry/approval";
import { Diff } from "@/registry/diff";
import { Reasoning } from "@/registry/reasoning";
import { RunStep, RunTimeline } from "@/registry/run-timeline";
import { TaskList } from "@/registry/task-list";
import { ToolCall } from "@/registry/tool-call";
import { UsageMeter } from "@/registry/usage-meter";

const REASONING =
  "The failing test says the retry helper gives up after the first error. " +
  "I need to read the current implementation before changing anything.";

const FILE_BEFORE = `export async function retry(fn) {
  try {
    return await fn();
  } catch (error) {
    throw error;
  }
}`;

const FILE_AFTER = `export async function retry(fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}`;

/**
 * Phases of the scripted run. `awaiting` is the interesting one: the demo
 * genuinely stops there until the visitor decides, because that is the whole
 * argument the library is making.
 */
type Phase =
  | "thinking"
  | "planning"
  | "reading"
  | "awaiting"
  | "writing"
  | "done"
  | "denied";

const AGENT_STATUS: Record<Phase, AgentRunStatus> = {
  thinking: "thinking",
  planning: "thinking",
  reading: "running",
  awaiting: "waiting",
  writing: "running",
  done: "done",
  denied: "idle",
};

function tasksFor(phase: Phase): TaskItem[] {
  const done = (id: string, label: string): TaskItem => ({ id, label, status: "done" });

  switch (phase) {
    case "thinking":
    case "planning":
      return [
        { id: "1", label: "Read the retry helper", status: "active" },
        { id: "2", label: "Add a retry loop", status: "pending" },
        { id: "3", label: "Re-run the test", status: "pending" },
      ];
    case "reading":
      return [
        { id: "1", label: "Read the retry helper", status: "active" },
        { id: "2", label: "Add a retry loop", status: "pending" },
        { id: "3", label: "Re-run the test", status: "pending" },
      ];
    case "awaiting":
    case "writing":
      return [
        done("1", "Read the retry helper"),
        { id: "2", label: "Add a retry loop", status: "active" },
        { id: "3", label: "Re-run the test", status: "pending" },
      ];
    case "done":
      return [
        done("1", "Read the retry helper"),
        done("2", "Add a retry loop"),
        done("3", "Re-run the test"),
      ];
    case "denied":
      return [
        done("1", "Read the retry helper"),
        { id: "2", label: "Add a retry loop", status: "skipped" },
        { id: "3", label: "Re-run the test", status: "skipped" },
      ];
  }
}

export function AgentRunDemo() {
  const [phase, setPhase] = React.useState<Phase>("thinking");
  const [reasoning, setReasoning] = React.useState("");
  const [written, setWritten] = React.useState("");
  const [runKey, setRunKey] = React.useState(0);

  const startedAt = React.useMemo(() => Date.now(), [runKey]);

  // Stream the reasoning text, then move on.
  React.useEffect(() => {
    if (phase !== "thinking") return;

    let index = 0;
    const id = setInterval(() => {
      index += 2;
      setReasoning(REASONING.slice(0, index));
      if (index >= REASONING.length) {
        clearInterval(id);
        setPhase("planning");
      }
    }, 22);
    return () => clearInterval(id);
  }, [phase, runKey]);

  // Advance the scripted phases that are not waiting on the visitor.
  React.useEffect(() => {
    const delays: Partial<Record<Phase, [number, Phase]>> = {
      planning: [700, "reading"],
      reading: [1400, "awaiting"],
    };
    const next = delays[phase];
    if (!next) return;

    const id = setTimeout(() => setPhase(next[1]), next[0]);
    return () => clearTimeout(id);
  }, [phase, runKey]);

  // Stream the rewritten file once the change is approved.
  React.useEffect(() => {
    if (phase !== "writing") return;

    let index = 0;
    const id = setInterval(() => {
      index += 4;
      setWritten(FILE_AFTER.slice(0, index));
      if (index >= FILE_AFTER.length) {
        clearInterval(id);
        setPhase("done");
      }
    }, 24);
    return () => clearInterval(id);
  }, [phase, runKey]);

  const replay = () => {
    setReasoning("");
    setWritten("");
    setPhase("thinking");
    setRunKey((key) => key + 1);
  };

  const approvalStatus =
    phase === "awaiting" ? "pending" : phase === "denied" ? "denied" : "approved";

  const showApproval = phase === "awaiting" || phase === "writing" || phase === "done" || phase === "denied";
  const showDiff = phase === "writing" || phase === "done";

  return (
    <div className="rounded-base border border-border bg-surface-muted/40 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AgentStatus
          status={AGENT_STATUS[phase]}
          label={
            phase === "reading"
              ? "Running read_file"
              : phase === "writing"
                ? "Writing the patch"
                : phase === "denied"
                  ? "Stopped, you denied the change"
                  : undefined
          }
        />
        <button
          type="button"
          onClick={replay}
          className="ml-auto rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Replay
        </button>
      </div>

      <RunTimeline label="Example agent run">
        <RunStep status={phase === "thinking" ? "active" : "done"}>
          <Reasoning
            text={reasoning}
            streaming={phase === "thinking"}
            startedAt={startedAt}
            autoCollapse
          />
        </RunStep>

        {phase !== "thinking" ? (
          <RunStep status={phase === "planning" ? "active" : "done"}>
            <TaskList items={tasksFor(phase)} />
          </RunStep>
        ) : null}

        {phase === "reading" || showApproval ? (
          <RunStep status={phase === "reading" ? "active" : "done"}>
            <ToolCall
              name="read_file"
              status={phase === "reading" ? "running" : "success"}
              input={{ path: "src/retry.ts" }}
              output={phase === "reading" ? undefined : FILE_BEFORE}
              startedAt={startedAt + 2000}
              endedAt={phase === "reading" ? undefined : startedAt + 3400}
            />
          </RunStep>
        ) : null}

        {showApproval ? (
          <RunStep status={phase === "awaiting" ? "active" : phase === "denied" ? "failed" : "done"}>
            <Approval
              action="Overwrite src/retry.ts"
              detail="The agent wants to replace the retry helper with a looping version."
              risk="high"
              status={approvalStatus}
              input={{ path: "src/retry.ts", bytes: FILE_AFTER.length }}
              allowAlways
              onDecision={(decision) =>
                setPhase(decision === "deny" ? "denied" : "writing")
              }
            />
          </RunStep>
        ) : null}

        {showDiff ? (
          <RunStep status={phase === "writing" ? "active" : "done"}>
            <Diff
              path="src/retry.ts"
              before={FILE_BEFORE}
              after={written}
              streaming={phase === "writing"}
            />
          </RunStep>
        ) : null}
      </RunTimeline>

      <div className="mt-4">
        <UsageMeter
          usage={{
            inputTokens: phase === "thinking" ? 1_240 : 8_420,
            outputTokens: phase === "done" ? 1_180 : 320,
            contextWindow: 200_000,
            costMicros: phase === "done" ? 42_000 : 9_000,
          }}
        />
      </div>
    </div>
  );
}
