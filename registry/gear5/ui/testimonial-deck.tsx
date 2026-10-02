"use client";

import { useState, type CSSProperties } from "react";

export interface DeckTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
}
export const deckTestimonials: DeckTestimonial[] = [
  {
    id: "a",
    quote:
      "The rare kind of collaborator who makes the idea better, then makes it happen.",
    name: "Jamie Chen",
    role: "Founder, Forma · Example testimonial",
  },
  {
    id: "b",
    quote:
      "Every interaction feels considered. Our product finally looks as good as it works.",
    name: "Morgan Lee",
    role: "Product lead, Mono · Example testimonial",
  },
  {
    id: "c",
    quote:
      "From the first conversation to the last detail, the whole process was a joy.",
    name: "Sam Rivera",
    role: "Editor, Terrain · Example testimonial",
  },
];
export interface TestimonialDeckProps {
  testimonials?: DeckTestimonial[];
  title?: string;
  eyebrow?: string;
  previousLabel?: string;
  nextLabel?: string;
  positionLabel?: (current: number, total: number) => string;
  accent?: string;
  className?: string;
}

/** Manual navigation; nothing auto-plays or moves focus when the quote changes. */
export function TestimonialDeck({
  testimonials = deckTestimonials,
  title = "Good work. Better company.",
  eyebrow = "Kind words",
  previousLabel = "Previous testimonial",
  nextLabel = "Next testimonial",
  positionLabel = (current, total) => `${current} / ${total}`,
  accent = "#d9fc87",
  className = "",
}: TestimonialDeckProps) {
  const [selected, setSelected] = useState(0);
  const active = Math.min(selected, Math.max(0, testimonials.length - 1));
  const item = testimonials[active];
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
      {item && (
        <>
          <div
            className="relative mt-8 min-h-64 rounded-2xl border border-white/15 bg-[#181a1c] p-6 transition-transform duration-300 motion-safe:hover:-translate-y-1 motion-reduce:transition-none sm:p-8"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              aria-hidden="true"
              className="font-serif text-6xl leading-none text-[var(--g5-accent)]"
            >
              “
            </span>
            <blockquote className="mt-2 max-w-2xl text-xl leading-relaxed tracking-[-.02em] sm:text-2xl">
              {item.quote}
            </blockquote>
            <div className="mt-7 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--g5-accent)] text-sm font-medium text-[#111214]"
              >
                {item.name.slice(0, 1)}
              </span>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="mt-1 text-xs text-[#b4b6af]">{item.role}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="font-mono text-xs text-[#b4b6af]">
              {positionLabel(active + 1, testimonials.length)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={previousLabel}
                disabled={testimonials.length < 2}
                onClick={() =>
                  setSelected(
                    (active - 1 + testimonials.length) % testimonials.length,
                  )
                }
                className="flex size-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-40"
              >
                ←
              </button>
              <button
                type="button"
                aria-label={nextLabel}
                disabled={testimonials.length < 2}
                onClick={() => setSelected((active + 1) % testimonials.length)}
                className="flex size-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
