import manifest from "@/registry/manifest.json";

import { REGISTRY_BASE } from "./site";

export type ComponentEntry = {
  slug: string;
  title: string;
  description: string;
  status: string;
  /** Whether a @gear5/core primitive backs this component. */
  headless: boolean;
};

/**
 * The catalog is owned by packages/core/registry.json — the same file the
 * registry generator reads — so the site and the installable JSON can never
 * disagree about what exists.
 */
export const components: ComponentEntry[] = manifest.components.map(
  ({ slug, title, description, status, headless }) => ({
    slug,
    title,
    description,
    status,
    headless,
  }),
);

export function getComponent(slug: string) {
  return components.find((entry) => entry.slug === slug);
}

export function installCommandFor(slug: string) {
  return `npx shadcn@latest add ${REGISTRY_BASE}/${slug}.json`;
}
