import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Checkpoint,
  CheckpointDiscardCount,
  CheckpointLabel,
  CheckpointRestore,
} from "./index";
import type { CheckpointRef } from "../types";
import {
  Attachment,
  AttachmentList,
  AttachmentMeta,
  AttachmentName,
  AttachmentProgress,
  AttachmentRemove,
} from "../attachment";
import type { AttachmentFile } from "../types";

const POINT: CheckpointRef = {
  id: "c1",
  label: "Before the migration",
  discards: 4,
};

function CheckpointExample(props: {
  current?: boolean;
  requireConfirm?: boolean;
  onRestore?: (c: CheckpointRef) => void;
}) {
  return (
    <Checkpoint checkpoint={POINT} {...props}>
      <CheckpointLabel />
      <CheckpointDiscardCount />
      <CheckpointRestore />
    </Checkpoint>
  );
}

describe("Checkpoint", () => {
  it("names the button against its checkpoint", () => {
    render(<CheckpointExample />);
    expect(
      screen.getByRole("button", { name: "Restore Before the migration" }),
    ).toBeInTheDocument();
  });

  it("says in words what restoring would throw away", () => {
    render(<CheckpointExample />);
    expect(screen.getByText("Discards 4 later steps")).toBeInTheDocument();
  });

  it("needs two presses, because restoring is destructive", async () => {
    const onRestore = vi.fn();
    render(<CheckpointExample onRestore={onRestore} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onRestore).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /Confirm/ }));
    expect(onRestore).toHaveBeenCalledWith(POINT);
  });

  it("lets Escape back out of an armed restore", async () => {
    const onRestore = vi.fn();
    render(<CheckpointExample onRestore={onRestore} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.keyboard("{Escape}");

    expect(
      screen.getByRole("button", { name: "Restore Before the migration" }),
    ).toBeInTheDocument();
    expect(onRestore).not.toHaveBeenCalled();
  });

  it("restores in one press when confirmation is waived", async () => {
    const onRestore = vi.fn();
    render(<CheckpointExample requireConfirm={false} onRestore={onRestore} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it("cannot restore the point the run is already at", async () => {
    const onRestore = vi.fn();
    render(<CheckpointExample current onRestore={onRestore} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("(current state)")).toBeInTheDocument();
    // Nothing to discard when you are already here.
    expect(screen.queryByText(/Discards/)).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(onRestore).not.toHaveBeenCalled();
  });
});

const FILES: AttachmentFile[] = [
  { id: "f1", name: "trace.json", size: 48_200, status: "ready" },
  { id: "f2", name: "screenshot.png", size: 1_240_000, status: "uploading", progress: 0.4 },
  { id: "f3", name: "huge.zip", size: 90_000_000, status: "error", error: "Too large" },
];

function AttachmentExample({ onRemove }: { onRemove?: (f: AttachmentFile) => void }) {
  return (
    <AttachmentList>
      {FILES.map((file) => (
        <Attachment key={file.id} file={file} onRemove={onRemove}>
          <AttachmentName />
          <AttachmentMeta />
          <AttachmentProgress />
          <AttachmentRemove />
        </Attachment>
      ))}
    </AttachmentList>
  );
}

describe("Attachment", () => {
  it("is a labelled list of files", () => {
    render(<AttachmentExample />);
    expect(screen.getByRole("list", { name: "Attachments" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("shows a readable size and speaks the state", () => {
    render(<AttachmentExample />);
    // One decimal only below 10, so chips stay narrow.
    expect(screen.getByText("48 kB")).toBeInTheDocument();
    expect(screen.getByText("48 kB. Ready")).toBeInTheDocument();
    expect(screen.getByText("1.2 MB")).toBeInTheDocument();
  });

  it("reads out the failure reason rather than just turning red", () => {
    render(<AttachmentExample />);
    expect(screen.getByText("90 MB. Too large")).toBeInTheDocument();
  });

  it("exposes upload progress, and only while uploading", () => {
    render(<AttachmentExample />);

    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(1);
    expect(bars[0]).toHaveAttribute("aria-valuenow", "40");
    expect(bars[0]).toHaveAttribute("aria-valuetext", "40% uploaded");
  });

  it("names each remove button against its file", async () => {
    const onRemove = vi.fn();
    render(<AttachmentExample onRemove={onRemove} />);

    const button = screen.getByRole("button", { name: "Remove trace.json" });
    await userEvent.click(button);
    expect(onRemove).toHaveBeenCalledWith(FILES[0]);
  });

  it("omits remove when there is no handler", () => {
    render(<AttachmentExample />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
