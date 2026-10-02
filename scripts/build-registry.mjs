/**
 * Compile registry.json into the flat `public/r/<name>.json` files that
 * `npx shadcn add <url>` consumes.
 *
 * Source files import each other by relative path so that the repo typechecks
 * and tests run against real modules. Consumers get them at different paths, so
 * those imports are rewritten to `@/` aliases on the way out.
 */

import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Mirrors lib/site.ts's getSiteUrl(). Duplicated rather than imported: this
 * script runs as plain Node before Next's compiler exists to resolve a `.ts`
 * import, and the alternative — deploying a registry whose own install
 * commands point at a domain nobody is serving — is worse than one small
 * function kept in sync by hand.
 */
function resolveSiteUrl(env) {
  const explicit = env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/** Where each registry type lands in a consumer's project. */
const TARGETS = {
  "registry:ui": "components/gear5",
  "registry:lib": "lib/gear5",
  "registry:hook": "hooks/gear5",
};

/**
 * Map a source module path to the alias a consumer will import it by.
 * `registry/gear5/lib/cn.ts` -> `@/lib/gear5/cn`
 */
function aliasFor(sourcePath, typeByBasename) {
  const basename = sourcePath.split("/").pop().replace(/\.tsx?$/, "");
  const type = typeByBasename.get(basename);
  if (!type) throw new Error(`Undeclared local registry import: ${sourcePath}`);
  return `@/${TARGETS[type]}/${basename}`;
}

function rewriteImports(content, typeByBasename) {
  // Only relative specifiers pointing inside registry/gear5 are rewritten;
  // anything else (react, next, …) is left exactly as the author wrote it.
  return content.replace(
    /from\s+(["'])(\.\.?\/[^"']+)\1/g,
    (match, quote, specifier) => `from ${quote}${aliasFor(specifier, typeByBasename)}${quote}`,
  );
}

async function writeJsonAtomic(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(value, null, 2), { flag: "wx" });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function buildRegistry(projectRoot = root, env = process.env) {
  const outDir = join(projectRoot, "public", "r");
  const homepage = resolveSiteUrl(env);
  const manifest = JSON.parse(await readFile(join(projectRoot, "registry.json"), "utf8"));
  if (!Array.isArray(manifest.items)) throw new Error("registry.json must contain an items array");
  const names = new Set();
  for (const item of manifest.items) {
    if (typeof item.name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name) || item.name === "index") {
      throw new Error(`Invalid registry name: ${item.name}`);
    }
    if (names.has(item.name)) throw new Error(`Duplicate registry name: ${item.name}`);
    names.add(item.name);
    if (!Object.hasOwn(TARGETS, item.type) || !Array.isArray(item.files) || !item.files.length) {
      throw new Error(`Invalid type or files for registry item: ${item.name}`);
    }
    for (const file of item.files) {
      if (!Object.hasOwn(TARGETS, file.type) ||
          !/^registry\/gear5\/(?:ui|lib)\/[a-z0-9-]+\.tsx?$/.test(file.path)) {
        throw new Error(`Invalid registry file in ${item.name}: ${file.path}`);
      }
    }
  }
  for (const item of manifest.items) {
    for (const dependency of item.registryDependencies ?? []) {
      if (!names.has(dependency)) throw new Error(`${item.name} has unknown dependency: ${dependency}`);
    }
  }

  // Basename -> registry type, so an import can be routed to the right target
  // directory without resolving the filesystem.
  const typeByBasename = new Map();
  for (const item of manifest.items) {
    for (const file of item.files) {
      const basename = file.path.split("/").pop().replace(/\.tsx?$/, "");
      if (typeByBasename.has(basename)) throw new Error(`Duplicate registry file basename: ${basename}`);
      typeByBasename.set(basename, file.type);
    }
  }

  const index = [];
  const outputs = new Map();

  for (const item of manifest.items) {
    const files = [];

    for (const file of item.files) {
      const raw = await readFile(join(projectRoot, file.path), "utf8");
      const basename = file.path.split("/").pop();

      files.push({
        path: `${TARGETS[file.type]}/${basename}`,
        content: rewriteImports(raw, typeByBasename),
        type: file.type,
        target: `${TARGETS[file.type]}/${basename}`,
      });
    }

    const built = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      dependencies: item.dependencies ?? [],
      registryDependencies: (item.registryDependencies ?? []).map(
        (dependency) => `${homepage}/r/${dependency}.json`,
      ),
      files,
    };

    outputs.set(`${item.name}.json`, built);

    index.push({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      url: `${homepage}/r/${item.name}.json`,
    });
  }

  // Read and validate every source before touching the last successful output.
  // Each rename publishes a complete JSON file; publish the index last. This
  // is per-file atomicity, not a transaction across the entire directory.
  await mkdir(outDir, { recursive: true });
  for (const [name, value] of outputs) await writeJsonAtomic(join(outDir, name), value);
  await writeJsonAtomic(join(outDir, "index.json"), { name: manifest.name, homepage, items: index });
  // Remove retired items only after all current items and the index exist.
  const written = await readdir(outDir);
  for (const name of written) {
    if (name.endsWith(".json") && name !== "index.json" && !outputs.has(name)) {
      await rm(join(outDir, name));
    }
  }
  return outputs.size + 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const count = await buildRegistry();
  console.log(`registry: wrote ${count} files to public/r`);
}
