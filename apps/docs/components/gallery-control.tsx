"use client";

import * as React from "react";
import type {
  ContextItem,
  GrantScope,
  RunControlState,
  ToolGrant,
} from "handoff-ui";
import { AgentHandoff } from "@/registry/agent-handoff";
import { ContextList } from "@/registry/context-list";
import { RetryAfter } from "@/registry/retry-after";
import { RunControls } from "@/registry/run-controls";
import { ToolPermissionList } from "@/registry/tool-permission";

/* -------------------------------------------------------------------------
 * Run controls
 * ---------------------------------------------------------------------- */

const NEXT_LABEL: Record<RunControlState, string> = {
  idle: "Start the run to see the controls appear.",
  running: "Running. Only pause and stop apply right now.",
  paused: "Paused. Step advances exactly one step.",
  stopped: "Stopped. Nothing left to control.",
};

export function RunControlsExample() {
  const [state, setState] = React.useState<RunControlState>("running");
  const [steps, setSteps] = React.useState(0);

  return (
    <div className="space-y-3">
      <RunControls
        state={state}
        onPause={() => setState("paused")}
        onResume={() => setState("running")}
        onStop={() => setState("stopped")}
        onStep={() => setSteps((n) => n + 1)}
      />

      <p className="text-xs text-fg-muted">
        {NEXT_LABEL[state]}
        {steps > 0 ? ` Stepped ${steps} ${steps === 1 ? "time" : "times"}.` : ""}
      </p>

      {state === "stopped" || state === "idle" ? (
        <button
          type="button"
          onClick={() => {
            setState("running");
            setSteps(0);
          }}
          className="text-xs text-fg-muted underline underline-offset-4 hover:text-fg"
        >
          Start again
        </button>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Tool permissions
 * ---------------------------------------------------------------------- */

const INITIAL_GRANTS: ToolGrant[] = [
  { toolName: "read_file", scope: "always" },
  { toolName: "write_file", scope: "session", constraint: "src/**" },
  { toolName: "run_command", scope: "once" },
];

export function ToolPermissionExample() {
  const [grants, setGrants] = React.useState(INITIAL_GRANTS);

  return (
    <div className="space-y-3">
      <ToolPermissionList
        grants={grants}
        onScopeChange={(scope: GrantScope, grant) =>
          setGrants((current) =>
            current.map((g) => (g.toolName === grant.toolName ? { ...g, scope } : g)),
          )
        }
        onRevoke={(grant) =>
          setGrants((current) => current.filter((g) => g.toolName !== grant.toolName))
        }
      />
      {grants.length === 0 ? (
        <button
          type="button"
          onClick={() => setGrants(INITIAL_GRANTS)}
          className="text-xs text-fg-muted underline underline-offset-4 hover:text-fg"
        >
          Restore the defaults
        </button>
      ) : (
        <p className="text-xs text-fg-muted">
          Every select and revoke button is labelled against its tool, so a
          column of them does not read as identical controls.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

const INITIAL_CONTEXT: ContextItem[] = [
  { id: "1", name: "src/retry.ts", kind: "file", tokens: 1_240 },
  { id: "2", name: "src/retry.test.ts", kind: "file", tokens: 890 },
  { id: "3", name: "README.md", kind: "file", tokens: 3_400, pinned: true },
  { id: "4", name: "example.com/rfc-9110", kind: "url", tokens: 12_800 },
  { id: "5", name: "Selected lines 40 to 88", kind: "selection", tokens: 320 },
];

export function ContextListExample() {
  const [items, setItems] = React.useState(INITIAL_CONTEXT);

  return (
    <div className="space-y-3">
      <ContextList
        items={items}
        budget={20_000}
        onRemove={(item) =>
          setItems((current) => current.filter((i) => i.id !== item.id))
        }
      />
      {items.length < INITIAL_CONTEXT.length ? (
        <button
          type="button"
          onClick={() => setItems(INITIAL_CONTEXT)}
          className="text-xs text-fg-muted underline underline-offset-4 hover:text-fg"
        >
          Put them back
        </button>
      ) : (
        <p className="text-xs text-fg-muted">
          The budget here is deliberately small, so the bar is close to full.
          Drop an item and watch it fall.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Agent handoff
 * ---------------------------------------------------------------------- */

export function AgentHandoffExample() {
  return (
    <div className="space-y-2">
      <AgentHandoff
        from="planner"
        to="researcher"
        reason="Needs the current schema"
        announce={false}
      />
      <AgentHandoff
        from="researcher"
        to="coder"
        reason="Research complete"
        announce={false}
      />
      <AgentHandoff from="coder" to="reviewer" announce={false} />
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Retry after
 * ---------------------------------------------------------------------- */

export function RetryAfterExample() {
  const [until, setUntil] = React.useState(() => Date.now() + 8_000);

  return (
    <div className="space-y-3">
      <RetryAfter until={until} onRetry={() => setUntil(Date.now() + 8_000)} />
      <p className="text-xs text-fg-muted">
        The button is disabled until the wait clears, so it never fails on
        purpose. Retrying starts a fresh eight second window.
      </p>
    </div>
  );
}
