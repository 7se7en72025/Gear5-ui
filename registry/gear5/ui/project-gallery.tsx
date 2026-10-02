"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { sanitizeHref } from "../lib/sanitize";

export interface GalleryProject {
  id: string;
  title: string;
  category: string;
  description: string;
  /** Add a locally hosted image, optimized with your framework, or a small SVG preview. */
  artwork?: ReactNode;
  artworkAlt?: string;
  href?: string;
  linkLabel?: string;
}

const exampleProjects: GalleryProject[] = [
  {
    id: "forma",
    title: "Forma",
    category: "Identity",
    description: "A quiet visual language for architecture with big ideas.",
    artworkAlt: "Abstract sage-green identity card showing a serif f.",
    artwork: (
      <div className="flex aspect-[5/4] items-center justify-center overflow-hidden bg-[#c8d5c1] text-[#273028]">
        <span className="font-serif text-[clamp(5rem,18vw,10rem)] tracking-[-.12em]">
          f.
        </span>
      </div>
    ),
    linkLabel: "Read the Forma case study",
  },
  {
    id: "mono",
    title: "Mono",
    category: "Product",
    description: "A calmer way to keep a small team moving forward.",
    artworkAlt: "Lavender product tile marked m with an upward arrow.",
    artwork: (
      <div className="flex aspect-[5/4] items-center justify-center overflow-hidden bg-[#d2ccef] text-[#302b48]">
        <span className="font-mono text-[clamp(4rem,15vw,8rem)] tracking-[-.16em]">
          m↗
        </span>
      </div>
    ),
    linkLabel: "Read the Mono case study",
  },
  {
    id: "terrain",
    title: "Terrain",
    category: "Digital",
    description: "A digital home that makes room for the natural world.",
    artworkAlt: "Warm sand-colored creative title card marked t.",
    artwork: (
      <div className="flex aspect-[5/4] items-center justify-center overflow-hidden bg-[#e8cdb5] text-[#49362b]">
        <span className="font-serif text-[clamp(4rem,15vw,8rem)] italic">
          t*
        </span>
      </div>
    ),
    linkLabel: "Read the Terrain case study",
  },
];

export interface ProjectGalleryProps {
  projects?: GalleryProject[];
  title?: string;
  eyebrow?: string;
  allLabel?: string;
  emptyLabel?: string;
  accent?: string;
  className?: string;
}

/** A filtered, image-forward portfolio grid with a keyboard-friendly detail preview. */
export function ProjectGallery({
  projects = exampleProjects,
  title = "Selected work, up close.",
  eyebrow = "A few things I’ve made",
  allLabel = "Everything",
  emptyLabel = "Add projects to see them here.",
  accent = "#d9fc87",
  className = "",
}: ProjectGalleryProps) {
  const id = useId();
  const [category, setCategory] = useState(allLabel);
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? "");
  const categories = [
    allLabel,
    ...new Set(projects.map((project) => project.category)),
  ];
  const visible =
    category === allLabel
      ? projects
      : projects.filter((project) => project.category === category);
  const selected =
    visible.find((project) => project.id === selectedId) ?? visible[0];

  function moveSelection(index: number) {
    const project = visible[index];
    if (project) setSelectedId(project.id);
  }

  return (
    <section
      style={{ "--g5-accent": accent } as CSSProperties}
      aria-labelledby={`${id}-title`}
      className={`rounded-3xl bg-[#111214] p-6 text-[#f4f4ef] sm:p-10 ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[11px] tracking-[.12em] text-[#b4b6af] uppercase">
            {eyebrow}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-3 text-3xl font-medium tracking-[-.05em] sm:text-4xl"
          >
            {title}
          </h2>
        </div>
        {categories.length > 2 && (
          <div aria-label="Filter projects" className="flex flex-wrap gap-2">
            {categories.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={category === option}
                onClick={() => setCategory(option)}
                className={`min-h-10 rounded-full border px-4 py-2 text-xs transition-colors motion-reduce:transition-none ${
                  category === option
                    ? "border-transparent bg-[var(--g5-accent)] font-medium text-[#111214]"
                    : "border-white/15 text-[#c2c4bd] hover:bg-white/5"
                }`}
              >
                {option === allLabel ? allLabel : option}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-white/10 px-5 py-12 text-center text-sm text-[#b4b6af]">
          {emptyLabel}
        </p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Projects"
            className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((project, index) => (
              <button
                key={project.id}
                id={`${id}-project-${project.id}`}
                type="button"
                aria-pressed={selected?.id === project.id}
                aria-controls={`${id}-detail`}
                onClick={() => moveSelection(index)}
                onKeyDown={(event) => {
                  let next: number;
                  if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = visible.length - 1;
                  else if (
                    event.key === "ArrowRight" ||
                    event.key === "ArrowDown"
                  )
                    next = (index + 1) % visible.length;
                  else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
                    next = (index - 1 + visible.length) % visible.length;
                  else return;
                  event.preventDefault();
                  moveSelection(next);
                  document
                    .getElementById(`${id}-project-${visible[next].id}`)
                    ?.focus();
                }}
                className={`group min-w-0 overflow-hidden rounded-2xl border text-start transition-[border-color,opacity] motion-reduce:transition-none ${
                  selected?.id === project.id
                    ? "border-[var(--g5-accent)]"
                    : "border-white/10 hover:border-white/35"
                }`}
              >
                <div
                  aria-hidden={!project.artworkAlt}
                  role={project.artworkAlt ? "img" : undefined}
                  aria-label={project.artworkAlt}
                  className="overflow-hidden [&>div]:transition-transform [&>div]:duration-500 motion-safe:group-hover:[&>div]:scale-[1.03] motion-reduce:[&>div]:transition-none"
                >
                  {project.artwork ?? (
                    <div className="flex aspect-[5/4] items-center justify-center bg-[#26292b] font-serif text-7xl text-white/70">
                      {project.title.slice(0, 1)}
                    </div>
                  )}
                </div>
                <span className="flex items-center justify-between gap-3 px-4 py-4">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {project.title}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] text-[#b4b6af]">
                      {project.category}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-sm text-[var(--g5-accent)]"
                  >
                    {selected?.id === project.id ? "↗" : "+"}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <article
              id={`${id}-detail`}
              aria-live="polite"
              aria-atomic="true"
              className="mt-4 grid overflow-hidden rounded-2xl border border-white/10 bg-[#181a1c] sm:grid-cols-[.8fr_1fr]"
            >
              <div
                aria-hidden={!selected.artworkAlt}
                role={selected.artworkAlt ? "img" : undefined}
                aria-label={selected.artworkAlt}
                className="min-h-48 overflow-hidden sm:min-h-64"
              >
                {selected.artwork ?? (
                  <div className="flex h-full min-h-48 items-center justify-center bg-[#26292b] font-serif text-8xl text-white/70 sm:min-h-64">
                    {selected.title.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="font-mono text-[10px] text-[var(--g5-accent)] uppercase">
                  {selected.category}
                </p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-.04em]">
                  {selected.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-[#b4b6af]">
                  {selected.description}
                </p>
                {selected.href && (
                  <a
                    href={sanitizeHref(selected.href)}
                    className="mt-6 inline-flex min-h-11 w-fit items-center gap-4 rounded-full border border-white/20 px-5 py-3 text-sm transition-colors hover:bg-white/5 motion-reduce:transition-none"
                  >
                    {selected.linkLabel ?? "View project"}
                    <span
                      aria-hidden="true"
                      className="text-[var(--g5-accent)]"
                    >
                      ↗
                    </span>
                  </a>
                )}
              </div>
            </article>
          )}
        </>
      )}
    </section>
  );
}
