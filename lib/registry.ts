import registryJson from "@/registry.json";
import { getSiteUrl } from "./site";

export interface RegistryFile {
  path: string;
  type: string;
}

export interface RegistryItem {
  name: string;
  type: "registry:ui" | "registry:block" | "registry:lib" | "registry:hook";
  title: string;
  description: string;
  category?: string;
  tier?: "xs" | "sm" | "md" | "lg" | "page";
  registryDependencies?: string[];
  dependencies?: string[];
  files: RegistryFile[];
}

const items = registryJson.items as RegistryItem[];

/** Every registry item, UI and primitive alike. */
export const allItems = items;

/** Copy-paste components, in registry order. */
export const components = items.filter((item) => item.type === "registry:ui");

/** Shared primitives the components build on. */
export const primitives = items.filter(
  (item) => item.type === "registry:lib" || item.type === "registry:hook",
);
export const templates = items.filter((item) => item.type === "registry:block");

export function getItem(name: string): RegistryItem | undefined {
  return items.find((item) => item.name === name);
}

/**
 * Components grouped by category, in the order categories first appear in the
 * registry — so the file is the single place that controls nav ordering.
 */
export function componentsByCategory(): Array<{
  category: string;
  items: RegistryItem[];
}> {
  const groups = new Map<string, RegistryItem[]>();

  for (const item of components) {
    const category = item.category ?? "Uncategorised";
    const existing = groups.get(category);

    if (existing) existing.push(item);
    else groups.set(category, [item]);
  }

  return [...groups].map(([category, items]) => ({ category, items }));
}

/** Everything an item pulls in, transitively, by registry name. */
export function resolveDependencies(
  name: string,
  seen = new Set<string>(),
): string[] {
  const item = getItem(name);
  if (!item) return [];

  for (const dependency of item.registryDependencies ?? []) {
    if (seen.has(dependency)) continue;

    seen.add(dependency);
    resolveDependencies(dependency, seen);
  }

  return [...seen];
}

/** Components that list `name` among their direct dependencies. */
export function dependentsOf(name: string): RegistryItem[] {
  return items.filter((item) =>
    (item.registryDependencies ?? []).includes(name),
  );
}

export function installCommand(name: string): string {
  return `npx shadcn@latest add ${getSiteUrl()}/r/${name}.json`;
}

/**
 * Gzipped ceiling per budget tier, in bytes.
 *
 * Must stay identical to `TIER_BUDGETS` in tests/budget.test.ts — a docs page
 * quoting a budget the suite does not actually enforce is worse than one that
 * quotes nothing. `tests/budget.test.ts` asserts the two agree.
 */
export const TIER_BUDGETS: Record<string, number> = {
  xs: 350,
  sm: 950,
  md: 1950,
  lg: 3300,
  page: 10000,
};

export const TIER_LABELS: Record<string, string> = {
  xs: "static display primitive",
  sm: "single-purpose control",
  md: "several states or a live subscription",
  lg: "composes several components",
  page: "complete template, including its component dependencies",
};
