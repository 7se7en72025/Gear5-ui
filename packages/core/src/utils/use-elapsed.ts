import * as React from "react";

interface UseElapsedOptions {
  /** Epoch milliseconds when the work began. */
  startedAt?: number;
  /** Epoch milliseconds when it finished. Freezes the result once set. */
  endedAt?: number;
  /** While true, the value ticks. Stop it to avoid a permanent timer. */
  active?: boolean;
  /** Tick interval in milliseconds. */
  intervalMs?: number;
}

/**
 * Elapsed milliseconds for a part, ticking while it is in flight.
 *
 * Returns `null` before mount so server and client render the same markup —
 * a live clock is the classic source of hydration mismatches.
 */
export function useElapsed({
  startedAt,
  endedAt,
  active = false,
  intervalMs = 100,
}: UseElapsedOptions): number | null {
  const settled =
    startedAt !== undefined && endedAt !== undefined ? endedAt - startedAt : null;

  const [now, setNow] = React.useState<number | null>(null);

  const shouldTick = active && settled === null && startedAt !== undefined;

  React.useEffect(() => {
    if (!shouldTick) return;

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [shouldTick, intervalMs]);

  if (settled !== null) return settled;
  if (now === null || startedAt === undefined) return null;
  return Math.max(0, now - startedAt);
}
