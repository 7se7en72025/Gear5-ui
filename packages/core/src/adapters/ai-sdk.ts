/**
 * Adapter: Vercel AI SDK `UIMessage.parts` -> Handoff parts.
 *
 * Deliberately duck-typed. Importing types from `ai` would make the SDK a hard
 * dependency of a UI library and lock consumers to one version, so we read the
 * shape structurally and degrade gracefully on anything unrecognised.
 */

import type { HandoffPart, ToolCallStatus } from "../types";

/** Minimal structural view of an AI SDK UI part. */
interface AISDKPart {
  type: string;
  text?: string;
  state?: string;
  toolCallId?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  [key: string]: unknown;
}

/** AI SDK tool part states, mapped onto our lifecycle. */
const TOOL_STATE_TO_STATUS: Record<string, ToolCallStatus> = {
  "input-streaming": "pending",
  "input-available": "running",
  "output-available": "success",
  "output-error": "error",
};

function isRecord(value: unknown): value is AISDKPart {
  return typeof value === "object" && value !== null && "type" in value;
}

/**
 * AI SDK encodes the tool name in the part type: `tool-read_file`. Dynamic
 * tools use a literal `dynamic-tool` type and carry `toolName` instead.
 */
function readToolName(part: AISDKPart): string | null {
  if (part.type === "dynamic-tool") {
    return typeof part.toolName === "string" ? part.toolName : "unknown";
  }
  if (part.type.startsWith("tool-")) {
    return part.type.slice("tool-".length) || "unknown";
  }
  return null;
}

/**
 * Convert one AI SDK part. Returns `null` for parts Handoff has no component
 * for (`step-start`, `file`, custom data parts) so callers can skip them.
 */
export function fromAISDKPart(part: unknown, index = 0): HandoffPart | null {
  if (!isRecord(part)) return null;

  const toolName = readToolName(part);
  if (toolName !== null) {
    const status = TOOL_STATE_TO_STATUS[part.state ?? ""] ?? "pending";
    return {
      type: "tool-call",
      id: part.toolCallId ?? `tool-${index}`,
      name: toolName,
      input: part.input,
      output: part.output,
      status,
      error: part.errorText,
    };
  }

  if (part.type === "reasoning") {
    return {
      type: "reasoning",
      id: `reasoning-${index}`,
      text: part.text ?? "",
      // AI SDK marks in-flight parts as `streaming`; absence means settled.
      streaming: part.state === "streaming",
    };
  }

  if (part.type === "text") {
    return {
      type: "text",
      id: `text-${index}`,
      text: part.text ?? "",
      streaming: part.state === "streaming",
    };
  }

  return null;
}

/** Convert a full `UIMessage.parts` array, dropping unsupported parts. */
export function fromAISDK(parts: readonly unknown[]): HandoffPart[] {
  if (!Array.isArray(parts)) return [];
  return parts
    .map((part, index) => fromAISDKPart(part, index))
    .filter((part): part is HandoffPart => part !== null);
}
