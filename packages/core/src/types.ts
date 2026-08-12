/**
 * The normalized agent event model.
 *
 * Handoff UI deliberately does not depend on any single AI SDK. Every component
 * reads these shapes, and thin adapters (see `src/adapters/`) translate from
 * whatever your backend emits — Vercel AI SDK, LangGraph, Mastra, or your own
 * protocol — into this model.
 *
 * Keep this file free of React imports. It is the contract, not the UI.
 */

/**
 * Lifecycle of a single tool invocation.
 *
 * `pending` means the model has requested the call but arguments may still be
 * streaming in, so `input` can be partial or undefined. `running` means the
 * arguments are complete and execution has started.
 */
export type ToolCallStatus =
  | "pending"
  | "running"
  | "success"
  | "error"
  | "cancelled";

/** Lifecycle of a human-in-the-loop approval gate. */
export type ApprovalStatus = "pending" | "approved" | "denied" | "expired";

/**
 * How much damage the action could do if approved incorrectly. Drives visual
 * emphasis and whether a component requires explicit confirmation.
 */
export type RiskLevel = "low" | "medium" | "high";

/** What the agent is doing right now, from the user's point of view. */
export type AgentRunStatus =
  | "idle"
  | "thinking"
  | "running"
  | "waiting"
  | "error"
  | "done";

/** Base fields shared by every part in a run. */
export interface HandoffPartBase {
  /** Stable across re-renders and streaming updates. Used as the React key. */
  id: string;
  /** Epoch milliseconds. Enables ordering and duration display. */
  startedAt?: number;
  /** Epoch milliseconds. Absent while the part is still in flight. */
  endedAt?: number;
}

/** A tool invocation: what was called, with what, and what came back. */
export interface ToolCallPart extends HandoffPartBase {
  type: "tool-call";
  /** The tool identifier, e.g. `read_file`. */
  name: string;
  /**
   * Arguments the model passed. May be a partial object or a partial JSON
   * string while `status` is `pending` — components must render it safely.
   */
  input?: unknown;
  /** Whatever the tool returned. Undefined until the call resolves. */
  output?: unknown;
  status: ToolCallStatus;
  /** Human-readable failure message when `status` is `error`. */
  error?: string;
}

/** A block of model reasoning, typically collapsed by default. */
export interface ReasoningPart extends HandoffPartBase {
  type: "reasoning";
  text: string;
  /** True while tokens are still arriving. Drives the live region. */
  streaming?: boolean;
}

/** A gate that blocks the run until a human approves or denies it. */
export interface ApprovalPart extends HandoffPartBase {
  type: "approval";
  /** Short imperative description, e.g. `Delete 12 files`. */
  action: string;
  /** Longer explanation of consequences, shown before the buttons. */
  detail?: string;
  /** The concrete payload being approved — a command, a diff, a request body. */
  input?: unknown;
  risk?: RiskLevel;
  status: ApprovalStatus;
  /** Epoch milliseconds after which the gate auto-denies. */
  expiresAt?: number;
}

/** A unified diff the agent proposes or has already applied. */
export interface DiffPart extends HandoffPartBase {
  type: "diff";
  /** Path being changed, used as the diff header. */
  path: string;
  /** Content before the change. Omit for a newly created file. */
  before?: string;
  /** Content after the change. Omit for a deleted file. */
  after?: string;
  /** True while `after` is still streaming in. */
  streaming?: boolean;
}

/** One item in the agent's plan. */
export interface TaskItem {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "failed" | "skipped";
}

/** The agent's current plan, which it may revise mid-run. */
export interface TaskListPart extends HandoffPartBase {
  type: "task-list";
  items: TaskItem[];
}

/** Plain model output. */
export interface TextPart extends HandoffPartBase {
  type: "text";
  text: string;
  streaming?: boolean;
}

/** One line of process output. */
export interface LogLine {
  id: string;
  text: string;
  /** stderr is usually worth distinguishing visually. */
  stream?: "stdout" | "stderr";
  timestamp?: number;
}

/** Streamed output from a long-running command. */
export interface LogPart extends HandoffPartBase {
  type: "log";
  lines: LogLine[];
  streaming?: boolean;
}

/** A document the agent grounded its answer in. */
export interface SourceRef {
  id: string;
  title: string;
  url?: string;
  /** Excerpt shown in the citation card. */
  snippet?: string;
}

/** One revision of an artifact. Agents rewrite their output repeatedly. */
export interface ArtifactVersion {
  id: string;
  label: string;
  content: string;
  createdAt?: number;
}

/** A file the user attached to a prompt. */
export interface AttachmentFile {
  id: string;
  name: string;
  /** Size in bytes. */
  size?: number;
  mimeType?: string;
  status?: "pending" | "uploading" | "ready" | "error";
  /** Upload progress, 0–1. Only meaningful while `uploading`. */
  progress?: number;
  error?: string;
}

/** A point in the run the user can rewind to. */
export interface CheckpointRef {
  id: string;
  label: string;
  createdAt?: number;
  /** How many later steps restoring this checkpoint would discard. */
  discards?: number;
}

/** A document, file, or canvas the agent produced. */
export interface ArtifactPart extends HandoffPartBase {
  type: "artifact";
  title: string;
  versions: ArtifactVersion[];
  /** Id of the version currently shown. Defaults to the last. */
  activeVersionId?: string;
  streaming?: boolean;
}

/** Any renderable unit of a run. */
export type HandoffPart =
  | TextPart
  | ToolCallPart
  | ReasoningPart
  | ApprovalPart
  | DiffPart
  | TaskListPart
  | LogPart
  | ArtifactPart;

/** Token and cost accounting for a run. */
export interface UsageStats {
  inputTokens?: number;
  outputTokens?: number;
  /** Portion of `inputTokens` served from cache, for cache-hit display. */
  cachedInputTokens?: number;
  /** Total context window size, used to render a fill indicator. */
  contextWindow?: number;
  /** Cost in the smallest currency unit to avoid float drift. */
  costMicros?: number;
  currency?: string;
}

/** A complete agent run: an ordered list of parts plus run-level metadata. */
export interface Run {
  id: string;
  status: AgentRunStatus;
  parts: HandoffPart[];
  usage?: UsageStats;
  startedAt?: number;
  endedAt?: number;
  model?: string;
}

/** Narrowing helper for consumers iterating a heterogeneous part list. */
export function isPartOfType<T extends HandoffPart["type"]>(
  part: HandoffPart,
  type: T,
): part is Extract<HandoffPart, { type: T }> {
  return part.type === type;
}

/** True when the part is still in flight and its content may change. */
export function isPartActive(part: HandoffPart): boolean {
  switch (part.type) {
    case "tool-call":
      return part.status === "pending" || part.status === "running";
    case "approval":
      return part.status === "pending";
    case "reasoning":
    case "text":
    case "diff":
    case "log":
    case "artifact":
      return part.streaming === true;
    case "task-list":
      return part.items.some((item) => item.status === "active");
    default:
      return false;
  }
}
