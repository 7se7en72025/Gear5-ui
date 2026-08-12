"use client";

import * as React from "react";
import type { ApprovalStatus } from "handoff-ui";
import { Approval } from "@/registry/approval";
import { AgentStatus } from "@/registry/agent-status";

/**
 * The hero demo.
 *
 * Approval is the component the whole library is arguing for, so it goes above
 * the fold and it is real. Nothing here is a screenshot.
 */
export function HeroApproval() {
  const [status, setStatus] = React.useState<ApprovalStatus>("pending");

  const agentStatus =
    status === "pending" ? "waiting" : status === "approved" ? "running" : "idle";

  const caption =
    status === "pending"
      ? "High risk, so approving takes two presses. Escape backs out."
      : status === "approved"
        ? "Approved. The run picks up where it left off."
        : "Denied. Nothing was written.";

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[2rem] bg-accent/5 blur-3xl"
      />

      <div className="relative rounded-panel border border-line bg-panel/70 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <AgentStatus
            status={agentStatus}
            label={
              status === "pending"
                ? "Waiting for you"
                : status === "approved"
                  ? "Writing the patch"
                  : "Stopped"
            }
          />
          {status === "pending" ? null : (
            <button
              type="button"
              onClick={() => setStatus("pending")}
              className="rounded-chip px-2 py-1 font-mono text-[11px] text-fg-faint transition-colors hover:text-fg"
            >
              Reset
            </button>
          )}
        </div>

        <Approval
          action="Overwrite src/retry.ts"
          detail="Replaces the retry helper with a looping version."
          risk="high"
          status={status}
          input={{ path: "src/retry.ts", bytes: 216 }}
          onDecision={(decision) =>
            setStatus(decision === "deny" ? "denied" : "approved")
          }
        />

        <p className="mt-3 px-1 text-[12px] leading-relaxed text-fg-faint">
          {caption}
        </p>
      </div>
    </div>
  );
}
