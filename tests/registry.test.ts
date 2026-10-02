// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { build } from "esbuild";
import { describe, expect, it } from "vitest";
import {
  allItems,
  components,
  templates,
  getItem,
  resolveDependencies,
} from "@/lib/registry";

describe("collection registry", () => {
  it("contains seven blocks and one complete template", () => {
    expect(components).toHaveLength(7);
    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe("portfolio-template");
  });
  it("declares every source import as an install dependency", () => {
    const ownerByFile = new Map(
      allItems.flatMap((item) =>
        item.files.map((file) => [
          file.path
            .split("/")
            .pop()!
            .replace(/\.tsx?$/, ""),
          item.name,
        ]),
      ),
    );
    for (const item of allItems) {
      const dependencies = resolveDependencies(item.name);
      expect(new Set(dependencies).size).toBe(dependencies.length);
      expect(dependencies.every((name) => Boolean(getItem(name)))).toBe(true);
      for (const file of item.files) {
        const source = readFileSync(file.path, "utf8");
        for (const match of source.matchAll(
          /from\s+["'](\.\.?\/[^"']+)["']/g,
        )) {
          const owner = ownerByFile.get(
            match[1]
              .split("/")
              .pop()!
              .replace(/\.tsx?$/, ""),
          );
          expect(owner).toBeDefined();
          if (owner !== item.name)
            expect(item.registryDependencies).toContain(owner);
        }
      }
    }
  });
  it("bundles the distributed template in a fresh consumer file tree", async () => {
    execFileSync(process.execPath, ["scripts/build-registry.mjs"]);
    const root = await mkdtemp(join(tmpdir(), "gear5-consumer-"));
    try {
      for (const name of [
        "portfolio-template",
        ...resolveDependencies("portfolio-template"),
      ]) {
        const built = JSON.parse(
          await readFile(`public/r/${name}.json`, "utf8"),
        );
        for (const file of built.files) {
          const target = join(root, file.target);
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, file.content);
        }
      }
      const result = await build({
        entryPoints: [join(root, "components/gear5/portfolio-template.tsx")],
        bundle: true,
        format: "esm",
        jsx: "automatic",
        alias: { "@": root },
        external: ["react", "react/jsx-runtime"],
        write: false,
        logLevel: "silent",
      });
      expect(result.outputFiles[0].text).toContain("PortfolioTemplate");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
