"use client";

import { useRef, type CSSProperties } from "react";
import { sanitizeHref } from "../lib/sanitize";

export interface OrbitHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  accent?: string;
  headingLevel?: "h1" | "h2";
  artworkLabels?: [string, string, string];
  mark?: string;
  className?: string;
}

/** Pointer-responsive artwork is decorative; content and links work without motion. */
export function OrbitHero({
  eyebrow = "Independent designer & developer",
  title = "Ideas into\nsomething real.",
  description = "Thoughtful digital experiences. A little unexpected. Always made for people.",
  action = { label: "Explore my work", href: "#work" },
  secondaryAction = { label: "Let’s talk", href: "#contact" },
  accent = "#d9fc87",
  headingLevel: Heading = "h2",
  artworkLabels = ["Design", "Build", "Make it move"],
  mark = "G5",
  className = "",
}: OrbitHeroProps) {
  const art = useRef<HTMLDivElement>(null);
  return (
    <section
      style={{ "--g5-accent": accent } as CSSProperties}
      className={`overflow-hidden rounded-3xl bg-[#111214] p-6 text-[#f4f4ef] sm:p-10 ${className}`}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="mb-6 flex items-center gap-2 font-mono text-[11px] tracking-[.12em] text-[#c2c4bd] uppercase">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[var(--g5-accent)]"
            />
            {eyebrow}
          </p>
          <Heading className="whitespace-pre-line text-[clamp(2.6rem,6.5vw,5.7rem)] leading-[.99] font-medium tracking-[-.075em]">
            {title}
          </Heading>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#b4b6af] sm:text-base">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={sanitizeHref(action.href)}
              className="inline-flex min-h-11 items-center gap-5 rounded-full bg-[var(--g5-accent)] px-6 py-3 text-sm font-semibold text-[#111214] transition-opacity hover:opacity-85 motion-reduce:transition-none"
            >
              {action.label}
              <span aria-hidden="true">↗</span>
            </a>
            <a
              href={sanitizeHref(secondaryAction.href)}
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 py-3 text-sm transition-colors hover:bg-white/10 motion-reduce:transition-none"
            >
              {secondaryAction.label}
            </a>
          </div>
        </div>
        <div
          ref={art}
          aria-hidden="true"
          className="relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center [perspective:900px]"
          onPointerMove={(event) => {
            if (event.pointerType === "touch" || !art.current) return;
            const box = event.currentTarget.getBoundingClientRect();
            art.current.style.setProperty(
              "--g5-x",
              `${((event.clientY - box.top) / box.height - 0.5) * -14}deg`,
            );
            art.current.style.setProperty(
              "--g5-y",
              `${((event.clientX - box.left) / box.width - 0.5) * 14}deg`,
            );
          }}
          onPointerLeave={() => {
            art.current?.style.setProperty("--g5-x", "0deg");
            art.current?.style.setProperty("--g5-y", "0deg");
          }}
        >
          <div className="absolute inset-6 rounded-full border border-dashed border-white/15" />
          <div className="absolute inset-16 rounded-full border border-white/10" />
          <div className="relative flex size-[65%] items-center justify-center rounded-[2.5rem] border border-white/15 bg-[#1e2023] shadow-[0_30px_80px_#0008] transition-transform duration-500 motion-safe:[transform:rotateX(var(--g5-x,0deg))_rotateY(var(--g5-y,0deg))_rotate(-12deg)] motion-reduce:transition-none">
            <span className="font-mono text-[clamp(4rem,10vw,8rem)] font-bold tracking-[-.12em] text-[var(--g5-accent)]">
              {mark}
            </span>
            <span className="absolute inset-5 rounded-[1.7rem] border border-white/10" />
          </div>
          <span className="absolute start-0 top-[17%] rounded-xl border border-white/20 bg-[#282b2e] px-5 py-3 font-mono text-xs shadow-xl motion-safe:-rotate-12">
            {artworkLabels[0]}
            <span className="ms-4 text-[var(--g5-accent)]">✳</span>
          </span>
          <span className="absolute end-0 top-[40%] rounded-xl bg-[var(--g5-accent)] px-5 py-3 font-mono text-xs text-[#111214] shadow-xl motion-safe:rotate-6">
            {artworkLabels[1]}
            <span className="ms-4">↗</span>
          </span>
          <span className="absolute bottom-[12%] start-[12%] rounded-xl border border-white/20 bg-[#282b2e] px-5 py-3 font-mono text-xs shadow-xl motion-safe:rotate-6">
            {artworkLabels[2]}
            <span className="ms-4 text-[var(--g5-accent)]">⌘</span>
          </span>
        </div>
      </div>
    </section>
  );
}
