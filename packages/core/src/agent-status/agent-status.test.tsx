import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentStatus, AgentStatusIndicator, AgentStatusLabel } from "./index";
import { RunTimeline, RunStep, RunStepMarker, RunStepContent } from "../run-timeline";

describe("AgentStatus", () => {
  it("exposes itself as a status region", () => {
    render(<AgentStatus status="thinking" />);
    expect(screen.getByRole("status")).toHaveTextContent("Thinking");
  });

  it("interrupts only when the run is blocked or broken", () => {
    const { rerender } = render(<AgentStatus status="thinking" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");

    rerender(<AgentStatus status="waiting" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "assertive");

    rerender(<AgentStatus status="error" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "assertive");
  });

  it("takes a custom label so the running tool can be named", () => {
    render(
      <AgentStatus status="running" label="Running read_file">
        <AgentStatusLabel />
      </AgentStatus>,
    );
    expect(screen.getByText("Running read_file")).toBeInTheDocument();
  });

  it("hides the indicator from assistive tech", () => {
    const { container } = render(
      <AgentStatus status="running">
        <AgentStatusIndicator />
        <AgentStatusLabel />
      </AgentStatus>,
    );

    const indicator = container.querySelector('[data-handoff-slot="indicator"]');
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });
});

describe("RunTimeline", () => {
  it("renders an ordered list so the sequence is conveyed", () => {
    const { container } = render(
      <RunTimeline label="Agent run">
        <RunStep status="done">
          <RunStepContent>Read src/index.ts</RunStepContent>
        </RunStep>
        <RunStep status="active">
          <RunStepContent>Patch the handler</RunStepContent>
        </RunStep>
      </RunTimeline>,
    );

    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Agent run" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("marks the active step as current", () => {
    render(
      <RunTimeline>
        <RunStep status="active">
          <RunStepContent>Working</RunStepContent>
        </RunStep>
      </RunTimeline>,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("aria-current", "step");
  });

  it("replaces the decorative marker with spoken status", () => {
    render(
      <RunTimeline>
        <RunStep status="failed">
          <RunStepMarker>●</RunStepMarker>
          <RunStepContent>Broke</RunStepContent>
        </RunStep>
      </RunTimeline>,
    );

    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("●")).toHaveAttribute("aria-hidden", "true");
  });
});
