/**
 * UPI Virtual Payment Address (VPA) parsing and validation.
 *
 * A VPA looks like `local@handle` — e.g. `9876543210@ybl`, `raiyyan@okhdfcbank`.
 *
 * Two things worth knowing before you read this:
 *
 * 1. There is no way to confirm a VPA actually exists without hitting NPCI
 *    (via a PSP's ValidateVPA / verify-vpa endpoint). Everything here is
 *    *structural* validation — it catches typos, not non-existent accounts.
 *    Always verify server-side before you move money.
 *
 * 2. An unknown handle is not an invalid handle. New PSPs launch constantly.
 *    We surface that as a warning so you never block a real user on our
 *    dataset being out of date.
 */

import { lookupHandle, type UpiHandle } from "./upi-handles";

/** Local part: alphanumerics plus `.`, `-`, `_`. */
const LOCAL_RE = /^[a-zA-Z0-9.\-_]+$/;
/** Handle: starts with a letter, then letters/digits. */
const HANDLE_RE = /^[a-zA-Z][a-zA-Z0-9]*$/;

const LOCAL_MIN = 2;
const LOCAL_MAX = 256;
const HANDLE_MIN = 2;
const HANDLE_MAX = 64;

export type VpaErrorCode =
  | "empty"
  | "missing_at"
  | "multiple_at"
  | "empty_local"
  | "empty_handle"
  | "local_too_short"
  | "local_too_long"
  | "local_invalid_chars"
  | "handle_too_short"
  | "handle_too_long"
  | "handle_invalid_chars";

export interface VpaError {
  code: VpaErrorCode;
  /** Human-readable, safe to render directly under the field. */
  message: string;
}

export interface VpaResult {
  /** Structurally valid. Does not mean the account exists. */
  valid: boolean;
  /** Lowercased `local@handle`. Present only when `valid`. */
  normalized?: string;
  local?: string;
  handle?: string;
  /** Registry metadata, when the handle is recognised. */
  provider?: UpiHandle;
  /**
   * True when the VPA is structurally fine but the handle isn't in our
   * registry. Show a hint, don't block submission.
   */
  unrecognisedHandle?: boolean;
  error?: VpaError;
}

function fail(code: VpaErrorCode, message: string): VpaResult {
  return { valid: false, error: { code, message } };
}

/**
 * Validate a VPA structurally.
 *
 * ```ts
 * validateVpa("9876543210@ybl")
 * // { valid: true, local: "9876543210", handle: "ybl", provider: { provider: "PhonePe", ... } }
 *
 * validateVpa("raiyyan@")
 * // { valid: false, error: { code: "empty_handle", message: "Add a bank handle after @…" } }
 * ```
 */
export function validateVpa(input: string): VpaResult {
  const raw = input.trim();

  if (!raw) {
    return fail("empty", "Enter a UPI ID.");
  }

  const atCount = (raw.match(/@/g) ?? []).length;
  if (atCount === 0) {
    return fail("missing_at", "A UPI ID needs an @ — like name@bank.");
  }
  if (atCount > 1) {
    return fail("multiple_at", "A UPI ID can only contain one @.");
  }

  const [local, handle] = raw.split("@");

  if (!local) {
    return fail("empty_local", "Add your name or phone number before the @.");
  }
  if (!handle) {
    return fail(
      "empty_handle",
      "Add a bank handle after the @ — like @ybl or @oksbi.",
    );
  }

  if (local.length < LOCAL_MIN) {
    return fail(
      "local_too_short",
      `The part before @ needs at least ${LOCAL_MIN} characters.`,
    );
  }
  if (local.length > LOCAL_MAX) {
    return fail(
      "local_too_long",
      `The part before @ can be at most ${LOCAL_MAX} characters.`,
    );
  }
  if (!LOCAL_RE.test(local)) {
    return fail(
      "local_invalid_chars",
      "The part before @ can only use letters, numbers, and . - _",
    );
  }

  if (handle.length < HANDLE_MIN) {
    return fail(
      "handle_too_short",
      `The handle after @ needs at least ${HANDLE_MIN} characters.`,
    );
  }
  if (handle.length > HANDLE_MAX) {
    return fail(
      "handle_too_long",
      `The handle after @ can be at most ${HANDLE_MAX} characters.`,
    );
  }
  if (!HANDLE_RE.test(handle)) {
    return fail(
      "handle_invalid_chars",
      "The handle after @ can only use letters and numbers.",
    );
  }

  const provider = lookupHandle(handle);

  return {
    valid: true,
    normalized: `${local.toLowerCase()}@${handle.toLowerCase()}`,
    local,
    handle: handle.toLowerCase(),
    provider,
    unrecognisedHandle: !provider,
  };
}

/** Convenience boolean wrapper around {@link validateVpa}. */
export function isValidVpa(input: string): boolean {
  return validateVpa(input).valid;
}

/**
 * True when the local part looks like an Indian mobile number, which is by far
 * the most common VPA shape. Useful for deciding to show a numeric keypad.
 */
export function isPhoneVpa(input: string): boolean {
  const result = validateVpa(input);
  return Boolean(
    result.valid && result.local && /^[6-9]\d{9}$/.test(result.local),
  );
}

/**
 * Split a partially-typed VPA so a UI can drive handle autocomplete while the
 * user is still typing. Never throws.
 */
export function splitVpa(input: string): {
  local: string;
  handle: string | null;
} {
  const at = input.indexOf("@");
  if (at === -1) return { local: input, handle: null };
  return { local: input.slice(0, at), handle: input.slice(at + 1) };
}

export type { UpiHandle, UpiHandleKind } from "./upi-handles";
export { lookupHandle, searchHandles, UPI_HANDLES } from "./upi-handles";
