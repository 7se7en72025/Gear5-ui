import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RunControlButton, RunControls } from "./index";
import type { RunControlState } from "../types";
import {
  ToolPermission,
  ToolPermissionList,
  ToolPermissionName,
  ToolPermissionRevoke,
  ToolPermissionScope,
} from "../tool-permission";
import type { ToolGrant } from "../types";
import { RetryAfter, RetryAfterButton, RetryAfterMessage } from "../retry-after";

function ControlsExample(props: {
  state: RunControlState;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onStep?: () => void;
}) {
  return (
    <RunControls {...props}>
      <RunControlButton action="pause" />
      <RunControlButton action="resume" />
      <RunControlButton action="step" />
      <RunControlButton action="stop" />
    </RunControls>
  );
}

const noop = () => {};

describe("RunControls", () => {
  it("offers only pause and stop while running", () => {
    render(
      <ControlsExample state="running" onPause={noop} onResume={noop} onStop={noop} onStep={noop} />,
    );

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resume" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Step" })).not.toBeInTheDocument();
  });

  it("offers resume, step, and stop while paused", () => {
    render(
      <ControlsExample state="paused" onPause={noop} onResume={noop} onStop={noop} onStep={noop} />,
    );

    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Step" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
  });

  it("offers nothing at all when idle or stopped", () => {
    const { rerender } = render(<ControlsExample state="idle" onPause={noop} onStop={noop} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);

    rerender(<ControlsExample state="stopped" onPause={noop} onStop={noop} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("hides a control whose handler was never supplied", () => {
    render(<ControlsExample state="running" onPause={noop} />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
  });

  it("dispatches the action it was given", async () => {
    const onPause = vi.fn();
    render(<ControlsExample state="running" onPause={onPause} onStop={noop} />);

    await userEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("announces the state change, since only a label moves on screen", () => {
    const { rerender } = render(<ControlsExample state="running" onPause={noop} onResume={noop} />);
    expect(screen.getByRole("status")).toHaveTextContent("");

    rerender(<ControlsExample state="paused" onPause={noop} onResume={noop} />);
    expect(screen.getByRole("status")).toHaveTextContent("Run paused.");

    rerender(<ControlsExample state="running" onPause={noop} onResume={noop} />);
    expect(screen.getByRole("status")).toHaveTextContent("Run resumed.");
  });

  it("is a labelled group", () => {
    render(<ControlsExample state="running" onPause={noop} />);
    expect(screen.getByRole("group", { name: "Run controls" })).toBeInTheDocument();
  });

  it("keeps a disabled control mounted when asked", () => {
    render(
      <RunControls state="paused" onPause={noop} onResume={noop}>
        <RunControlButton action="pause" keepMounted />
      </RunControls>,
    );
    expect(screen.getByRole("button", { name: "Pause" })).toBeDisabled();
  });
});

const GRANTS: ToolGrant[] = [
  { toolName: "read_file", scope: "always" },
  { toolName: "write_file", scope: "session", constraint: "src/**" },
];

function PermissionExample(props: {
  onRevoke?: (g: ToolGrant) => void;
  onScopeChange?: (s: string, g: ToolGrant) => void;
}) {
  return (
    <ToolPermissionList>
      {GRANTS.map((grant) => (
        <ToolPermission
          key={grant.toolName}
          grant={grant}
          onRevoke={props.onRevoke}
          onScopeChange={props.onScopeChange as never}
        >
          <ToolPermissionName />
          <ToolPermissionScope />
          <ToolPermissionRevoke />
        </ToolPermission>
      ))}
    </ToolPermissionList>
  );
}

describe("ToolPermission", () => {
  it("lists the standing grants", () => {
    render(<PermissionExample />);
    expect(screen.getByRole("list", { name: "Tool permissions" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("labels each scope select against its tool", () => {
    render(<PermissionExample />);
    expect(
      screen.getByRole("combobox", { name: "Permission for read_file" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /Permission for write_file/ }),
    ).toBeInTheDocument();
  });

  it("reports a scope change with the grant it belongs to", async () => {
    const onScopeChange = vi.fn();
    render(<PermissionExample onScopeChange={onScopeChange} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Permission for read_file" }),
      "once",
    );
    expect(onScopeChange).toHaveBeenCalledWith("once", GRANTS[0]);
  });

  it("names each revoke button against its tool", async () => {
    const onRevoke = vi.fn();
    render(<PermissionExample onRevoke={onRevoke} />);

    await userEvent.click(screen.getByRole("button", { name: "Revoke read_file" }));
    expect(onRevoke).toHaveBeenCalledWith(GRANTS[0]);
  });

  it("omits revoke when there is no handler", () => {
    render(<PermissionExample />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("RetryAfter", () => {
  it("keeps retry disabled until the wait clears", async () => {
    vi.useFakeTimers();
    try {
      const onRetry = vi.fn();
      render(
        <RetryAfter until={Date.now() + 3000} onRetry={onRetry}>
          <RetryAfterMessage />
          <RetryAfterButton />
        </RetryAfter>,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByText(/Try again in/)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3200);
      });

      expect(screen.getByRole("button")).toBeEnabled();
      expect(screen.getByText("Ready to try again.")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("announces readiness rather than counting down out loud", async () => {
    vi.useFakeTimers();
    try {
      render(
        <RetryAfter until={Date.now() + 500} onRetry={() => {}}>
          <RetryAfterButton />
        </RetryAfter>,
      );

      expect(screen.getByRole("status")).toHaveTextContent("");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });
      expect(screen.getByRole("status")).toHaveTextContent("You can try again now.");
    } finally {
      vi.useRealTimers();
    }
  });

  it("fires onReady exactly once", async () => {
    vi.useFakeTimers();
    try {
      const onReady = vi.fn();
      render(
        <RetryAfter until={Date.now() - 1} onReady={onReady}>
          <RetryAfterButton />
        </RetryAfter>,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(onReady).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
