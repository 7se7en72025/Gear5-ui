/**
 * Generate the shadcn-compatible registry into `public/r/`.
 *
 * `npx shadcn add <url>` fetches one JSON file per component containing its
 * source, so the styled layer is copied into the consumer's repo rather than
 * installed as a dependency they cannot edit. Generating it from the same
 * files the docs site renders means the published source can never drift from
 * the component the demos on the page are using.
 */
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, "..");
const coreRoot = path.resolve(docsRoot, "..", "..", "packages", "core");
const srcDir = path.join(coreRoot, "src");
const outDir = path.join(docsRoot, "public", "r");

/** Every component pulls in `cn`, so it ships alongside each one. */
const UTILS = {
  source: path.join(srcDir, "lib", "utils.ts"),
  path: "lib/utils.ts",
  type: "registry:lib",
  target: "lib/utils.ts",
};

async function readManifest() {
  const raw = await readFile(path.join(coreRoot, "registry.json"), "utf8");
  const { components } = JSON.parse(raw);
  if (!Array.isArray(components) || components.length === 0) {
    throw new Error("registry.json declares no components");
  }
  return components;
}

/**
 * A component only needs `cn` shipped with it if it actually imports it —
 * otherwise the consumer gets a file they never use.
 */
function usesCn(sources) {
  return sources.some((s) => /from\s+["'].*lib\/utils["']/.test(s));
}

async function buildItem(entry) {
  const sources = await Promise.all(
    entry.files.map((file) => readFile(path.join(srcDir, file), "utf8")),
  );

  const files = entry.files.map((file, i) => ({
    path: `components/ui/${path.basename(file)}`,
    type: "registry:ui",
    target: `components/ui/${path.basename(file)}`,
    content: sources[i],
  }));

  if (usesCn(sources)) {
    files.push({ ...UTILS, content: await readFile(UTILS.source, "utf8") });
    delete files[files.length - 1].source;
  }

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: entry.slug,
    type: "registry:ui",
    title: entry.title,
    description: entry.description,
    dependencies: entry.dependencies ?? [],
    registryDependencies: entry.registryDependencies ?? [],
    files,
  };
}

async function main() {
  const components = await readManifest();

  // Rebuild from scratch so a component removed from the manifest does not
  // linger as a stale, still-installable JSON file.
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  for (const entry of components) {
    const item = await buildItem(entry);
    await writeFile(
      path.join(outDir, `${entry.slug}.json`),
      `${JSON.stringify(item, null, 2)}\n`,
    );
  }

  // An index lets consumers (and us) discover what the registry contains.
  await writeFile(
    path.join(outDir, "index.json"),
    `${JSON.stringify(
      components.map(({ slug, title, description }) => ({
        name: slug,
        title,
        description,
      })),
      null,
      2,
    )}\n`,
  );

  console.log(`registry: wrote ${components.length} component(s) to public/r/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
