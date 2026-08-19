import manifest from "@gear5/core/registry.json";

import { REGISTRY_BASE } from "./site";

export type ComponentEntry = {
  slug: string;
  title: string;
  description: string;
  status: string;
};

/**
 * The catalog is owned by packages/core/registry.json — the same file the
 * registry generator reads — so the site and the installable JSON can never
 * disagree about what exists.
 */
export const components: ComponentEntry[] = manifest.components.map(
  ({ slug, title, description, status }) => ({
    slug,
    title,
    description,
    status,
  }),
);

export function getComponent(slug: string) {
  return components.find((entry) => entry.slug === slug);
}

export function installCommandFor(slug: string) {
  return `npx shadcn@latest add ${REGISTRY_BASE}/${slug}.json`;
}
