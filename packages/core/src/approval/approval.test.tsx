import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Approval,
  ApprovalAction,
  ApprovalDetail,
  ApprovalRisk,
  ApprovalPayload,
  ApprovalActions,
  ApprovalApprove,
  ApprovalDeny,
  ApprovalAlways,
  ApprovalOutcome,
} from "./index";
import type { ApprovalProps } from "./index";

function Example(props: Partial<ApprovalProps>) {
  return (
    <Approval action="Delete 12 files" {...props}>
      <ApprovalAction />
      <ApprovalDetail />
      <ApprovalRisk />
      <ApprovalPayload />
      <ApprovalActions>
        <ApprovalDeny />
        <ApprovalApprove />
        <ApprovalAlways />
      </ApprovalActions>
      <ApprovalOutcome />
    </Approval>
  );
}

describe("Approval", () => {
  it("labels the group by its action and describes it by the detail", () => {
    render(<Example detail="This cannot be undone." />);

    const group = screen.getByRole("group");
    const action = screen.getByText("Delete 12 files");
    const detail = screen.getByText("This cannot be undone.");

    expect(group).toHaveAttribute("aria-labelledby", action.id);
    expect(group).toHaveAttribute("aria-describedby", detail.id);
  });

  it("approves in one press at medium risk", async () => {
    const onDecision = vi.fn();
    render(<Example risk="medium" onDecision={onDecision} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision).toHaveBeenCalledWith("approve");
  });

  it("requires a second press at high risk", async () => {
    const onDecision = vi.fn();
    render(<Example risk="high" onDecision={onDecision} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecision).not.toHaveBeenCalled();

    // The label changes so the armed state is never ambiguous.
    const confirm = screen.getByRole("button", { name: "Confirm" });
    await userEvent.click(confirm);
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision).toHaveBeenCalledWith("approve");
  });

  it("lets Escape back out of a pending confirm without deciding", async () => {
    const onDecision = vi.fn();
    render(<Example risk="high" onDecision={onDecision} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(onDecision).not.toHaveBeenCalled();
  });

  it("never puts deny behind a confirm step", async () => {
    const onDecision = vi.fn();
    render(<Example risk="high" onDecision={onDecision} />);

    await userEvent.click(screen.getByRole("button", { name: "Deny" }));
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision).toHaveBeenCalledWith("deny");
  });

  it("respects an explicit requireConfirm over the risk default", async () => {
    const onDecision = vi.fn();
    render(<Example risk="high" requireConfirm={false} onDecision={onDecision} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision).toHaveBeenCalledWith("approve");
  });

  it("reports the always-allow decision separately", async () => {
    const onDecision = vi.fn();
    render(<Example risk="low" onDecision={onDecision} />);

    await userEvent.click(screen.getByRole("button", { name: "Always allow" }));
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision).toHaveBeenCalledWith("always");
  });

  it("disables the buttons and shows an outcome once resolved", async () => {
    const onDecision = vi.fn();
    render(<Example status="approved" onDecision={onDecision} />);

    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deny" })).toBeDisabled();
    expect(screen.getByText("Approved")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecision).not.toHaveBeenCalled();
  });

  it("announces the request assertively because the run is blocked", () => {
    render(<Example risk="high" />);
    const alert = screen.getByRole("alert");

    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Approval needed, high risk: Delete 12 files.");
  });

  it("states the armed confirm out loud", async () => {
    render(<Example risk="high" />);
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Delete 12 files needs confirmation. Press approve again.",
    );
  });

  it("fires onExpire once when the deadline passes", async () => {
    vi.useFakeTimers();
    try {
      const onExpire = vi.fn();
      // Deadline already in the past: the first tick should trip it.
      render(<Example expiresAt={Date.now() - 1} onExpire={onExpire} />);

      // The countdown ticks on an interval, so the state updates it triggers
      // have to be flushed inside act.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
      });
      expect(onExpire).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("moves focus to the safe choice when autoFocus is set", () => {
    render(<Example autoFocus />);
    expect(screen.getByRole("button", { name: "Deny" })).toHaveFocus();
  });

  it("leaves focus alone by default", () => {
    render(<Example />);
    expect(screen.getByRole("button", { name: "Deny" })).not.toHaveFocus();
  });

  it("renders the payload under review", () => {
    render(<Example input={{ paths: ["src/old.ts"] }} />);
    expect(screen.getByText(/src\/old\.ts/)).toBeInTheDocument();
  });
});
