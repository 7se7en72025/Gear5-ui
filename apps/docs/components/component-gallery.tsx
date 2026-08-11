"use client";

import * as React from "react";
import type { ApprovalStatus, TaskItem } from "handoff-ui";
import { AgentStatus } from "@/registry/agent-status";
import { Approval } from "@/registry/approval";
import { Diff } from "@/registry/diff";
import { Reasoning } from "@/registry/reasoning";
import { RunStep, RunTimeline } from "@/registry/run-timeline";
import { TaskList } from "@/registry/task-list";
import { ToolCall } from "@/registry/tool-call";
import { UsageMeter } from "@/registry/usage-meter";

export function ApprovalExample() {
  const [status, setStatus] = React.useState<ApprovalStatus>("pending");

  return (
    <div className="space-y-3">
      <Approval
        action="Delete 12 files in src/legacy"
        detail="This cannot be undone from the agent session."
        risk="high"
        status={status}
        input={{ paths: ["src/legacy/*.ts"], count: 12 }}
        allowAlways
        onDecision={(decision) =>
          setStatus(decision === "deny" ? "denied" : "approved")
        }
      />
      {status !== "pending" ? (
        <button
          type="button"
          onClick={() => setStatus("pending")}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Reset
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">
          High risk, so approving takes two presses. Escape backs out.
        </p>
      )}
    </div>
  );
}

export function ToolCallExample() {
  return (
    <div className="space-y-2">
      <ToolCall
        name="read_file"
        status="success"
        input={{ path: "src/retry.ts" }}
        output={"export async function retry(fn) { … }"}
        startedAt={0}
        endedAt={840}
      />
      <ToolCall
        name="run_tests"
        status="error"
        input={{ filter: "retry" }}
        error="1 test failed: retries once instead of three times"
        startedAt={0}
        endedAt={4200}
      />
    </div>
  );
}

export function ReasoningExample() {
  return (
    <Reasoning
      text={
        "The helper rethrows immediately, so the loop never runs more than once. " +
        "Wrapping the call in a bounded for-loop and keeping the last error is enough."
      }
      startedAt={0}
      endedAt={3100}
    />
  );
}

const BEFORE = `function total(items) {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
}`;

const AFTER = `function total(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`;

export function DiffExample() {
  return <Diff path="src/cart.ts" before={BEFORE} after={AFTER} />;
}

const TASKS: TaskItem[] = [
  { id: "1", label: "Reproduce the failure", status: "done" },
  { id: "2", label: "Patch the retry helper", status: "active" },
  { id: "3", label: "Re-run the suite", status: "pending" },
  { id: "4", label: "Update the changelog", status: "pending" },
];

export function TaskListExample() {
  return <TaskList items={TASKS} />;
}

export function AgentStatusExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <AgentStatus status="idle" />
      <AgentStatus status="thinking" />
      <AgentStatus status="running" label="Running read_file" />
      <AgentStatus status="waiting" />
      <AgentStatus status="error" />
      <AgentStatus status="done" />
    </div>
  );
}

export function RunTimelineExample() {
  return (
    <RunTimeline label="Example trace">
      <RunStep status="done">
        <p className="text-sm">Read the failing test</p>
      </RunStep>
      <RunStep status="done">
        <p className="text-sm">Read src/retry.ts</p>
      </RunStep>
      <RunStep status="active">
        <p className="text-sm">Applying the patch</p>
      </RunStep>
      <RunStep status="pending">
        <p className="text-sm text-muted-foreground">Re-run the suite</p>
      </RunStep>
    </RunTimeline>
  );
}

export function UsageMeterExample() {
  return (
    <div className="space-y-2">
      <UsageMeter
        usage={{
          inputTokens: 24_800,
          outputTokens: 1_940,
          contextWindow: 200_000,
          costMicros: 68_000,
        }}
      />
      <UsageMeter
        usage={{
          inputTokens: 178_000,
          outputTokens: 9_400,
          contextWindow: 200_000,
          costMicros: 512_000,
        }}
      />
    </div>
  );
}
