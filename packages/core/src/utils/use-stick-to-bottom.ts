import * as React from "react";

export interface UseStickToBottomOptions {
  /** Turn the behaviour off entirely, e.g. once the stream ends. */
  enabled?: boolean;
  /** How close to the bottom still counts as pinned, in pixels. */
  threshold?: number;
}

export interface StickToBottom<T extends HTMLElement> {
  /** Attach to the scrolling element. */
  ref: React.RefCallback<T>;
  /** True while the view is following new output. */
  isPinned: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/**
 * Follow streaming output, but stop the moment the user scrolls away.
 *
 * Naive autoscroll yanks the view back down while someone is reading earlier
 * output, which is the single most common bug in log and chat panes. Growth is
 * detected with a ResizeObserver on the content rather than on render, so it
 * stays correct no matter how the consumer produces lines.
 */
export function useStickToBottom<T extends HTMLElement>({
  enabled = true,
  threshold = 32,
}: UseStickToBottomOptions = {}): StickToBottom<T> {
  const nodeRef = React.useRef<T | null>(null);
  const [isPinned, setIsPinned] = React.useState(true);

  // Read by observers that must not be re-created when the flag flips.
  const pinnedRef = React.useRef(true);
  const enabledRef = React.useRef(enabled);
  const thresholdRef = React.useRef(threshold);
  React.useEffect(() => {
    enabledRef.current = enabled;
    thresholdRef.current = threshold;
  }, [enabled, threshold]);

  const setPinned = React.useCallback((next: boolean) => {
    if (pinnedRef.current === next) return;
    pinnedRef.current = next;
    setIsPinned(next);
  }, []);

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const node = nodeRef.current;
      if (!node) return;
      node.scrollTo({ top: node.scrollHeight, behavior });
      setPinned(true);
    },
    [setPinned],
  );

  const ref = React.useCallback<React.RefCallback<T>>(
    (node) => {
      nodeRef.current = node;
      if (!node) return;

      const atBottom = () =>
        node.scrollHeight - node.scrollTop - node.clientHeight <=
        thresholdRef.current;

      const onScroll = () => setPinned(atBottom());
      node.addEventListener("scroll", onScroll, { passive: true });

      // Start at the bottom, which is where new output appears.
      node.scrollTop = node.scrollHeight;

      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          if (enabledRef.current && pinnedRef.current) {
            node.scrollTop = node.scrollHeight;
          }
        });
        // Observing the content, not the viewport: the viewport size rarely
        // changes, but the content grows on every chunk.
        observer.observe(node);
        for (const child of Array.from(node.children)) observer.observe(child);
      }

      return () => {
        node.removeEventListener("scroll", onScroll);
        observer?.disconnect();
      };
    },
    [setPinned],
  );

  return { ref, isPinned, scrollToBottom };
}
