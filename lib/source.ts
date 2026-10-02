import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { RegistryItem } from "./registry";
/** Read installer-ready source, with the same rewritten imports consumers receive. */
export async function readSource(item: RegistryItem): Promise<string> {
  const built = JSON.parse(
    await readFile(
      join(
        /* turbopackIgnore: true */ process.cwd(),
        "public/r",
        `${item.name}.json`,
      ),
      "utf8",
    ),
  );
  return built.files[0].content;
}
