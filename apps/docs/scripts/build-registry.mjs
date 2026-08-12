/**
 * Generate the shadcn-compatible registry into `public/r/`.
 *
 * `npx shadcn add <url>` fetches one JSON file per component containing its
 * source, so the styled layer is copied into the consumer's repo rather than
 * installed as a dependency they cannot edit. Generating it from the same files
 * the docs site renders means the published source can never drift from the
 * demos on the page.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outDir = path.join(root, "public", "r");

/** Every component pulls in `cn`, so it ships alongside each one. */
const UTILS_FILE = {
  path: "lib/utils.ts",
  type: "registry:lib",
  target: "lib/utils.ts",
};

const COMPONENTS = [
  { name: "approval", title: "Approval" },
  { name: "tool-call", title: "Tool Call" },
  { name: "reasoning", title: "Reasoning" },
  { name: "diff", title: "Diff" },
  { name: "code-block", title: "Code Block" },
  { name: "log-stream", title: "Log Stream" },
  { name: "artifact", title: "Artifact" },
  { name: "citation", title: "Citation" },
  { name: "composer", title: "Composer" },
  { name: "run-timeline", title: "Run Timeline" },
  { name: "task-list", title: "Task List" },
  { name: "agent-status", title: "Agent Status" },
  { name: "usage-meter", title: "Usage Meter" },
];

const DESCRIPTIONS = {
  approval: "Human-in-the-loop gate with risk levels and a two-press confirm.",
  "tool-call": "Tool invocation rendered as an accessible disclosure.",
  reasoning: "Collapsible model reasoning that folds away once settled.",
  diff: "Streaming-aware line diff.",
  "code-block": "Code with a copy button that reports success and failure.",
  "log-stream":
    "Process output with ANSI colour and autoscroll that releases when you scroll away.",
  artifact: "A document the agent produced, with its revision history.",
  citation: "Inline source reference with an expandable card.",
  composer: "Prompt input that auto-resizes and becomes a stop button mid-run.",
  "run-timeline": "Ordered trace of agent steps.",
  "task-list": "The agent's plan, with aggregate progress.",
  "agent-status": "Indicator for what the agent is doing right now.",
  "usage-meter": "Token, cost, and context-window readout.",
};

async function readSource(relativePath) {
  return readFile(path.join(root, "registry", relativePath), "utf8");
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const utilsContent = await readSource("lib/utils.ts");
  const index = [];

  for (const { name, title } of COMPONENTS) {
    const content = await readSource(`${name}.tsx`);

    const item = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name,
      type: "registry:ui",
      title,
      description: DESCRIPTIONS[name],
      dependencies: ["handoff-ui", "clsx", "tailwind-merge"],
      files: [
        {
          path: `${name}.tsx`,
          content,
          type: "registry:ui",
          target: `components/handoff/${name}.tsx`,
        },
        { ...UTILS_FILE, content: utilsContent },
      ],
    };

    await writeFile(
      path.join(outDir, `${name}.json`),
      `${JSON.stringify(item, null, 2)}\n`,
      "utf8",
    );
    index.push({ name, title, description: DESCRIPTIONS[name] });
  }

  await writeFile(
    path.join(outDir, "index.json"),
    `${JSON.stringify({ name: "handoff-ui", homepage: "https://handoff-ui.dev", items: index }, null, 2)}\n`,
    "utf8",
  );

  console.log(`[handoff-ui] wrote ${COMPONENTS.length} registry items to public/r/`);
}

await main();
