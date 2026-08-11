/** Compact, stable duration text: `840ms`, `1.4s`, `2m 05s`. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;

  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (minutes < 60) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** Token counts get long fast; `128000` reads better as `128k`. */
export function formatTokens(count: number): string {
  if (!Number.isFinite(count) || count < 0) return "—";
  if (count < 1000) return String(Math.round(count));
  if (count < 1_000_000) {
    const thousands = count / 1000;
    return `${thousands < 10 ? thousands.toFixed(1) : Math.round(thousands)}k`;
  }
  return `${(count / 1_000_000).toFixed(1)}M`;
}

/**
 * Costs arrive in micros to dodge float drift. Sub-cent amounts are common in
 * agent runs, so keep four decimals until the value is worth rounding.
 */
export function formatCost(micros: number, currency = "USD"): string {
  if (!Number.isFinite(micros) || micros < 0) return "—";
  const value = micros / 1_000_000;
  const fractionDigits = value > 0 && value < 0.01 ? 4 : 2;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    // Unknown currency code — fall back rather than crash the render.
    return `${value.toFixed(fractionDigits)} ${currency}`;
  }
}

/**
 * Render tool arguments that may still be streaming.
 *
 * Partial JSON, circular references, and `undefined` all show up mid-flight, so
 * this never throws — it degrades to the closest readable representation.
 */
export function safeStringify(value: unknown, indent = 2): string {
  if (value === undefined) return "";
  if (typeof value === "string") return value;

  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(
      value,
      (_key, val: unknown) => {
        if (typeof val === "bigint") return `${val.toString()}n`;
        if (typeof val === "function") return "[Function]";
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
        }
        return val;
      },
      indent,
    );
  } catch {
    return String(value);
  }
}
