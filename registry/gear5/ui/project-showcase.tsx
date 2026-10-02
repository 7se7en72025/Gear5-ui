"use client";

import type { CSSProperties } from "react";
import { sanitizeHref } from "../lib/sanitize";

export interface ShowcaseProject {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  symbol: string;
  color: string;
}
export const showcaseProjects: ShowcaseProject[] = [
  {
    id: "forma",
    title: "Forma",
    category: "Brand identity · 2026",
    description:
      "A new visual language for an architecture studio. Identity, website, and a system built to grow.",
    href: "#contact",
    symbol: "f.",
    color: "#d5e6d3",
  },
  {
    id: "mono",
    title: "Mono",
    category: "Product design · 2026",
    description:
      "Turning a complex creative workflow into a quiet, focused workspace. From first sketch to shipped product.",
    href: "#contact",
    symbol: "m↗",
    color: "#c9c4e4",
  },
  {
    id: "terrain",
    title: "Terrain",
    category: "Digital experience · 2025",
    description:
      "An independent publication for the places in between. Editorial design with room to explore.",
    href: "#contact",
    symbol: "t*",
    color: "#ead3b9",
  },
];
export interface ProjectShowcaseProps {
  projects?: ShowcaseProject[];
  title?: string;
  eyebrow?: string;
  linkLabel?: string;
  accent?: string;
  className?: string;
}

/** Native details makes every project expandable with keyboard, touch, or pointer. */
export function ProjectShowcase({
  projects = showcaseProjects,
  title = "A few things I’ve made.",
  eyebrow = "Selected work",
  linkLabel = "Discuss a similar project",
  accent = "#d9fc87",
  className = "",
}: ProjectShowcaseProps) {
  return (
    <section
      style={{ "--g5-accent": accent } as CSSProperties}
      className={`rounded-3xl bg-[#111214] p-6 text-[#f4f4ef] sm:p-10 ${className}`}
    >
      <p className="font-mono text-[11px] tracking-[.12em] text-[#b4b6af] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-medium tracking-[-.05em] sm:text-4xl">
        {title}
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {projects.map((project, index) => (
          <details
            key={project.id}
            className="group min-w-0 rounded-2xl border border-white/15 bg-[#181a1c] open:border-[var(--g5-accent)]"
          >
            <summary className="cursor-pointer list-none p-3 [&::-webkit-details-marker]:hidden">
              <div
                style={{ background: project.color }}
                className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl text-[#17191b]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-5 rounded-full border border-black/15"
                />
                <span
                  aria-hidden="true"
                  className="font-serif text-7xl font-bold tracking-[-.1em] transition-transform duration-500 motion-safe:group-hover:scale-110 motion-safe:group-focus-within:scale-110 motion-reduce:transition-none"
                >
                  {project.symbol}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute start-4 top-4 font-mono text-[10px]"
                >
                  0{index + 1} /
                </span>
              </div>
              <span className="mt-4 flex items-center justify-between gap-3 px-1">
                <span className="text-lg font-medium">{project.title}</span>
                <span
                  aria-hidden="true"
                  className="flex size-7 items-center justify-center rounded-full border border-white/20 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </span>
              <span className="mt-1 mb-2 block px-1 text-xs text-[#b4b6af]">
                {project.category}
              </span>
            </summary>
            <div className="border-t border-white/15 p-4">
              <p className="text-sm leading-6 text-[#b4b6af]">
                {project.description}
              </p>
              <a
                href={sanitizeHref(project.href)}
                className="mt-4 inline-flex min-h-11 items-center gap-3 text-sm text-[var(--g5-accent)] underline-offset-4 hover:underline"
              >
                {linkLabel}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
