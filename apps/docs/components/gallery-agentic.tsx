"use client";

import * as React from "react";
import type { ArtifactVersion, LogLine, SourceRef } from "@gear5/core";
import { Artifact } from "@/registry/artifact";
import { Citation } from "@/registry/citation";
import { Composer } from "@/registry/composer";
import { CodeBlock } from "@/registry/code-block";
import { LogStream } from "@/registry/log-stream";

/* -------------------------------------------------------------------------
 * Log stream
 * ---------------------------------------------------------------------- */

// Written as escapes rather than literal control characters so the source
// stays readable and safe to copy.
const E = "\u001b";

const BUILD_OUTPUT = [
  "$ pnpm build",
  "",
  `${E}[2m> @gear5/core@0.1.0 build${E}[0m`,
  `${E}[34m>${E}[0m compiling 128 modules...`,
  `${E}[32m✓${E}[0m compiled in 2.4s`,
  `${E}[33m!${E}[0m 2 chunks exceed the recommended size`,
  "  chunks/vendor.js  248 kB",
  "  chunks/editor.js  191 kB",
  `${E}[34m>${E}[0m running 125 tests...`,
  `${E}[32m✓${E}[0m 125 passed`,
  `${E}[38;5;208m→${E}[0m writing dist/`,
  `${E}[1;32m✓ build succeeded${E}[0m`,
];

export function LogStreamExample() {
  const [count, setCount] = React.useState(BUILD_OUTPUT.length);
  const streaming = count < BUILD_OUTPUT.length;

  React.useEffect(() => {
    if (!streaming) return;
    const id = setTimeout(() => setCount((n) => n + 1), 380);
    return () => clearTimeout(id);
  }, [streaming, count]);

  const lines: LogLine[] = BUILD_OUTPUT.slice(0, count).map((text, index) => ({
    id: String(index),
    text,
    stream: text.includes("!") ? "stderr" : "stdout",
  }));

  return (
    <div className="space-y-3">
      <LogStream lines={lines} streaming={streaming} label="Build output" />
      <button
        type="button"
        onClick={() => setCount(0)}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Replay stream
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Artifact
 * ---------------------------------------------------------------------- */

const VERSIONS: ArtifactVersion[] = [
  {
    id: "v1",
    label: "First pass",
    content: "# Incident report\n\nThe API returned 500s for about ten minutes.",
  },
  {
    id: "v2",
    label: "Added timeline",
    content: [
      "# Incident report",
      "",
      "The API returned 500s for about ten minutes.",
      "",
      "## Timeline",
      "",
      "- 14:02 deploy goes out",
      "- 14:04 error rate climbs",
      "- 14:12 rollback completes",
    ].join("\n"),
  },
  {
    id: "v3",
    label: "Added cause",
    content: [
      "# Incident report",
      "",
      "The API returned 500s for about ten minutes.",
      "",
      "## Timeline",
      "",
      "- 14:02 deploy goes out",
      "- 14:04 error rate climbs",
      "- 14:12 rollback completes",
      "",
      "## Cause",
      "",
      "A migration dropped an index the hot query relied on.",
    ].join("\n"),
  },
];

export function ArtifactExample() {
  return <Artifact title="incident-report.md" versions={VERSIONS} />;
}

/* -------------------------------------------------------------------------
 * Citation
 * ---------------------------------------------------------------------- */

const SOURCES: SourceRef[] = [
  {
    id: "s1",
    title: "Postgres docs: index maintenance",
    url: "https://example.com/postgres/indexes",
    snippet:
      "Dropping an index that a frequently executed query depends on can cause a sudden increase in latency.",
  },
  {
    id: "s2",
    title: "Internal runbook: rollback procedure",
    snippet:
      "Roll back first, diagnose second. A rollback should complete within ten minutes of the alert firing.",
  },
];

export function CitationExample() {
  return (
    <p className="max-w-xl text-sm leading-8">
      The outage came from a migration that dropped an index the hot query
      relied on
      <Citation source={SOURCES[0] as SourceRef} index={1} />, and the team
      followed the standard rollback path rather than debugging in production
      <Citation source={SOURCES[1] as SourceRef} index={2} />.
    </p>
  );
}

/* -------------------------------------------------------------------------
 * Composer
 * ---------------------------------------------------------------------- */

export function ComposerExample() {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!busy) return;
    const id = setTimeout(() => setBusy(false), 2500);
    return () => clearTimeout(id);
  }, [busy]);

  return (
    <div className="space-y-2">
      <Composer
        value={value}
        onValueChange={setValue}
        busy={busy}
        maxLength={200}
        onSubmit={(text) => {
          setSent(text);
          setValue("");
          setBusy(true);
        }}
        onStop={() => setBusy(false)}
      />
      <p className="text-xs text-muted-foreground">
        {busy
          ? "Running. Send became Stop, and stopping will not resend the draft."
          : sent
            ? `Sent: "${sent}"`
            : "Enter sends, Shift+Enter adds a line. The box grows as you type."}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Code block
 * ---------------------------------------------------------------------- */

const SNIPPET = [
  "export async function retry(fn, attempts = 3) {",
  "  let lastError;",
  "  for (let i = 0; i < attempts; i++) {",
  "    try {",
  "      return await fn();",
  "    } catch (error) {",
  "      lastError = error;",
  "    }",
  "  }",
  "  throw lastError;",
  "}",
].join("\n");

export function CodeBlockExample() {
  return (
    <CodeBlock
      code={SNIPPET}
      language="ts"
      filename="src/retry.ts"
      showLineNumbers
    />
  );
}
