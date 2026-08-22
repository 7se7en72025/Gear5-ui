"use client";

import * as React from "react";
import type { ArgumentValues, EnvironmentRef } from "@gear5/core";
import { ArgumentEditor } from "@/registry/argument-editor";
import { EnvironmentBadge } from "@/registry/environment-badge";
import { Guardrail } from "@/registry/guardrail";

/* -------------------------------------------------------------------------
 * Environment badge
 * ---------------------------------------------------------------------- */

const TARGETS: EnvironmentRef[] = [
  { kind: "production", name: "api-prod-eu", destructive: true },
  { kind: "staging", name: "api-staging" },
  { kind: "development", name: "localhost:5432" },
  { kind: "sandbox" },
];

export function EnvironmentBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      {TARGETS.map((environment) => (
        <EnvironmentBadge key={environment.kind} environment={environment} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Guardrail
 * ---------------------------------------------------------------------- */

export function GuardrailExample() {
  const [allowed, setAllowed] = React.useState(false);

  return (
    <div className="space-y-3">
      <Guardrail
        action="Write to /etc/hosts"
        rule={{
          id: "fs-1",
          name: "no-writes-outside-workspace",
          explanation:
            "The agent may only write inside the project directory. This path is outside it.",
        }}
        input={{ path: "/etc/hosts", bytes: 412 }}
        onOverride={allowed ? undefined : () => setAllowed(true)}
      />

      <p className="text-xs text-fg-muted">
        {allowed
          ? "Allowed once. The override disappears rather than staying clickable."
          : "Naming the rule turns a dead end into something you can act on."}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Argument editor
 * ---------------------------------------------------------------------- */

const PROPOSED: ArgumentValues = {
  path: "src/retry.ts",
  attempts: 3,
  overwrite: true,
  options: { encoding: "utf8", mode: 420 },
};

export function ArgumentEditorExample() {
  const [values, setValues] = React.useState(PROPOSED);
  const edited = Object.keys(values).filter(
    (key) => !Object.is(values[key], PROPOSED[key]),
  );

  return (
    <div className="space-y-3">
      <ArgumentEditor values={values} original={PROPOSED} onChange={setValues} />
      <p className="text-xs text-fg-muted">
        {edited.length > 0
          ? `Edited: ${edited.join(", ")}. What the model proposed stays visible beside each change.`
          : "Change a value. The model's original stays on screen so you can see exactly what you altered."}
      </p>
    </div>
  );
}
