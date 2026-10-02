import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { buildRegistry } from "../scripts/build-registry.mjs";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "gear5-registry-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "registry/gear5/ui"), { recursive: true });
  await mkdir(join(root, "registry/gear5/lib"), { recursive: true });
  const manifest = {
    name: "fixture",
    items: [
      { name: "cn", type: "registry:lib", files: [{ path: "registry/gear5/lib/cn.ts", type: "registry:lib" }] },
      { name: "button", type: "registry:ui", registryDependencies: ["cn"], files: [{ path: "registry/gear5/ui/button.tsx", type: "registry:ui" }] },
    ],
  };
  await writeFile(join(root, "registry.json"), JSON.stringify(manifest));
  await writeFile(join(root, "registry/gear5/lib/cn.ts"), "export const cn = (...values) => values.join(' ');");
  await writeFile(join(root, "registry/gear5/ui/button.tsx"), 'import { cn } from "../lib/cn";\nimport React from \'react\';\nexport { cn } from \'../lib/cn\';');
  const output = join(root, "public/r");
  const read = async (name) => JSON.parse(await readFile(join(output, name), "utf8"));
  const snapshot = async () => Promise.all((await readdir(output)).sort().map(async (name) => [name, await readFile(join(output, name), "utf8")]));
  return { root, output, manifest, read, snapshot };
}

test("build emits installable targets, rewrites both quote styles, and is reproducible", async (t) => {
  const f = await fixture(t);
  const env = { NEXT_PUBLIC_SITE_URL: "https://ui.example.com/" };
  assert.equal(await buildRegistry(f.root, env), 3);
  const item = await f.read("button.json");
  assert.deepEqual(item.registryDependencies, ["https://ui.example.com/r/cn.json"]);
  assert.equal(item.files[0].target, "components/gear5/button.tsx");
  assert.match(item.files[0].content, /from "@\/lib\/gear5\/cn"/);
  assert.match(item.files[0].content, /from '@\/lib\/gear5\/cn'/);
  assert.match(item.files[0].content, /from 'react'/);
  const before = await f.snapshot();
  await buildRegistry(f.root, env);
  assert.deepEqual(await f.snapshot(), before);
  assert.deepEqual((await f.read("index.json")).items.map((item) => item.name), ["cn", "button"]);
});

test("deployment URL precedence matches the site", async (t) => {
  const f = await fixture(t);
  for (const [env, expected] of [
    [{ NEXT_PUBLIC_SITE_URL: "https://explicit.example", VERCEL_PROJECT_PRODUCTION_URL: "production.example" }, "https://explicit.example"],
    [{ VERCEL_PROJECT_PRODUCTION_URL: "production.example", VERCEL_URL: "preview.example" }, "https://production.example"],
    [{ VERCEL_URL: "preview.example" }, "https://preview.example"],
    [{}, "http://localhost:3000"],
  ]) {
    await buildRegistry(f.root, env);
    assert.equal((await f.read("index.json")).homepage, expected);
  }
});

test("complete block templates install into the components directory", async (t) => {
  const f = await fixture(t);
  f.manifest.items[1].type = "registry:block";
  f.manifest.items[1].files[0].type = "registry:block";
  await writeFile(join(f.root, "registry.json"), JSON.stringify(f.manifest));
  await buildRegistry(f.root, {});
  const built = await f.read("button.json");
  assert.equal(built.type, "registry:block");
  assert.equal(built.files[0].target, "components/gear5/button.tsx");
});

test("missing source leaves every previous install file intact", async (t) => {
  const f = await fixture(t);
  await buildRegistry(f.root, {});
  const before = await f.snapshot();
  await rm(join(f.root, "registry/gear5/ui/button.tsx"));
  await assert.rejects(buildRegistry(f.root, {}), { code: "ENOENT" });
  assert.deepEqual(await f.snapshot(), before);
});

for (const [name, mutate, message] of [
  ["duplicate names", (m) => m.items.push(m.items[0]), /Duplicate registry name/],
  ["unknown dependencies", (m) => m.items[1].registryDependencies.push("missing"), /unknown dependency/],
  ["unsafe output names", (m) => { m.items[1].name = "../escape"; }, /Invalid registry name/],
  ["reserved index name", (m) => { m.items[1].name = "index"; }, /Invalid registry name/],
  ["unknown file types", (m) => { m.items[1].files[0].type = "constructor"; }, /Invalid registry file/],
  ["source traversal", (m) => { m.items[1].files[0].path = "../outside.ts"; }, /Invalid registry file/],
  ["ambiguous basenames", (m) => { m.items[1].files[0].path = "registry/gear5/ui/cn.ts"; }, /Duplicate registry file basename/],
]) {
  test(`${name} fails before changing existing output`, async (t) => {
    const f = await fixture(t);
    await buildRegistry(f.root, {});
    const before = await f.snapshot();
    mutate(f.manifest);
    await writeFile(join(f.root, "registry.json"), JSON.stringify(f.manifest));
    await assert.rejects(buildRegistry(f.root, {}), message);
    assert.deepEqual(await f.snapshot(), before);
  });
}

test("undeclared relative imports fail before changing existing output", async (t) => {
  const f = await fixture(t);
  await buildRegistry(f.root, {});
  const before = await f.snapshot();
  await writeFile(join(f.root, "registry/gear5/ui/button.tsx"), 'import { missing } from "../lib/missing";');
  await assert.rejects(buildRegistry(f.root, {}), /Undeclared local registry import/);
  assert.deepEqual(await f.snapshot(), before);
});

test("failed file replacement cleans its temporary file and preserves the old index", async (t) => {
  const f = await fixture(t);
  await buildRegistry(f.root, {});
  const indexBefore = await readFile(join(f.output, "index.json"), "utf8");
  await rm(join(f.output, "button.json"));
  await mkdir(join(f.output, "button.json"));
  await assert.rejects(buildRegistry(f.root, { NEXT_PUBLIC_SITE_URL: "https://new.example" }));
  assert.equal(await readFile(join(f.output, "index.json"), "utf8"), indexBefore);
  assert.equal((await readdir(f.output)).some((name) => name.endsWith(".tmp")), false);
});

test("successful rebuild removes retired JSON items and keeps unrelated files", async (t) => {
  const f = await fixture(t);
  await buildRegistry(f.root, {});
  await writeFile(join(f.output, "keep.txt"), "unrelated");
  f.manifest.items.pop();
  await writeFile(join(f.root, "registry.json"), JSON.stringify(f.manifest));
  assert.equal(await buildRegistry(f.root, {}), 2);
  assert.deepEqual((await readdir(f.output)).sort(), ["cn.json", "index.json", "keep.txt"]);
});
