import * as React from "react";

/**
 * key-with-colon | string | number | literal
 *
 * Built per call rather than hoisted: a `/g` regex carries mutable `lastIndex`
 * state, which would be shared across concurrent renders.
 */
const token = () =>
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?)|(true|false|null)/g;

function classFor(match: RegExpExecArray): string {
  if (match[1]) return "tok-key";
  if (match[2]) return "tok-string";
  if (match[3]) return "tok-number";
  return "tok-bool";
}

/**
 * Minimal JSON syntax highlighter. Renders real elements rather than
 * dangerouslySetInnerHTML, so arbitrary values can't inject markup.
 */
export function JsonView({ value, className }: { value: unknown; className?: string }) {
  const source = JSON.stringify(value, null, 2) ?? "null";
  const nodes: React.ReactNode[] = [];

  const pattern = token();
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > cursor) {
      nodes.push(
        <span key={`p${cursor}`} className="tok-punct">
          {source.slice(cursor, match.index)}
        </span>,
      );
    }
    nodes.push(
      <span key={match.index} className={classFor(match)}>
        {match[0]}
      </span>,
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < source.length) {
    nodes.push(
      <span key="tail" className="tok-punct">
        {source.slice(cursor)}
      </span>,
    );
  }

  return <code className={className}>{nodes}</code>;
}
