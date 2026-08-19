import { REGISTRY_BASE } from "./site";

export type ComponentEntry = {
  slug: string;
  name: string;
  description: string;
  status: "stable" | "planned";
};

export const components: ComponentEntry[] = [
  {
    slug: "one-piece-background",
    name: "One Piece Background",
    description:
      "Animated ocean sunset background with layered waves and atmospheric effects.",
    status: "stable",
  },
];

export function getComponent(slug: string) {
  return components.find((entry) => entry.slug === slug);
}

export function installCommandFor(slug: string) {
  return `npx shadcn@latest add ${REGISTRY_BASE}/${slug}.json`;
}
