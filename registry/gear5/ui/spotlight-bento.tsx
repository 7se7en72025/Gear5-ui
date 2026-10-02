"use client";

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
  type PointerEvent,
} from "react";
import { sanitizeHref } from "../lib/sanitize";

export interface BentoFeature {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  size?: "standard" | "wide" | "tall";
  visual?: ReactNode;
  href?: string;
  linkLabel?: string;
}

const defaults: BentoFeature[] = [
  {
    id: "direction",
    eyebrow: "01 / A clear point of view",
    title: "Know what makes you, you.",
    description: "A considered identity gives every detail a place to belong.",
    size: "wide",
    visual: (
      <div
        aria-hidden="true"
        className="flex items-center gap-3 overflow-hidden"
      >
        <span className="font-serif text-6xl tracking-[-.08em]">Aa</span>
        <span className="h-px flex-1 bg-current/30" />
        <span className="font-mono text-xs">FIND YOUR FORM</span>
      </div>
    ),
  },
  {
    id: "details",
    eyebrow: "02 / Made with intention",
    title: "The little things add up.",
    description:
      "From the first hello to the final hover, every moment feels considered.",
    size: "tall",
    visual: (
      <div aria-hidden="true" className="flex gap-2">
        {["#d9fc87", "#d2ccef", "#e8cdb5"].map((color, index) => (
          <span
            key={color}
            style={{
              backgroundColor: color,
              transform: `translateY(${index * -5}px)`,
            }}
            className="size-10 rounded-xl"
          />
        ))}
      </div>
    ),
  },
  {
    id: "delivery",
    eyebrow: "03 / Ready to go further",
    title: "Beautiful, then usable.",
    description:
      "A smooth handoff keeps the good work moving into the real world.",
    visual: (
      <div
        aria-hidden="true"
        className="flex items-center gap-2 font-mono text-sm"
      >
        <span className="rounded-full border border-current/20 px-3 py-2">
          Brief
        </span>
        <span className="text-[var(--g5-accent)]">→</span>
        <span className="rounded-full border border-current/20 px-3 py-2">
          Launch
        </span>
      </div>
    ),
  },
  {
    id: "people",
    eyebrow: "04 / Built around real people",
    title: "A thoughtful way to move forward.",
    description:
      "Make a useful promise clear, then give people a confident next step.",
    visual: (
      <div
        aria-hidden="true"
        className="flex items-center gap-3 font-mono text-xs text-white/60"
      >
        <span className="size-8 rounded-full border border-white/20 bg-[var(--g5-accent)]/20" />
        MADE FOR PEOPLE
      </div>
    ),
  },
];

export interface SpotlightBentoProps {
  features?: BentoFeature[];
  title?: string;
  eyebrow?: string;
  accent?: string;
  className?: string;
}

/** Unequal content tiles with a restrained mouse spotlight and static touch fallback. */
export function SpotlightBento({
  features = defaults,
  title = "Good ideas, with room to breathe.",
  eyebrow = "The details make it",
  accent = "#d9fc87",
  className = "",
}: SpotlightBentoProps) {
  const id = useId();
  const reducedMotion = useRef(false);
  useEffect(() => {
    const preference = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    if (!preference) return;

    const update = () => {
      reducedMotion.current = preference.matches;
    };
    update();
    preference.addEventListener?.("change", update);
    return () => preference.removeEventListener?.("change", update);
  }, []);
  return (
    <section
      style={{ "--g5-accent": accent } as CSSProperties}
      aria-labelledby={`${id}-title`}
      className={`rounded-3xl bg-[#111214] p-6 text-[#f4f4ef] sm:p-10 ${className}`}
    >
      <p className="font-mono text-[11px] tracking-[.12em] text-[#b4b6af] uppercase">
        {eyebrow}
      </p>
      <h2
        id={`${id}-title`}
        className="mt-3 max-w-2xl text-3xl font-medium tracking-[-.05em] sm:text-4xl"
      >
        {title}
      </h2>
      {features.length === 0 ? (
        <p className="mt-6 text-sm text-[#b4b6af]">
          Add a feature to start your grid.
        </p>
      ) : (
        <div className="mt-8 grid auto-rows-[minmax(12rem,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Tag = feature.href ? "a" : "article";
            const linkProps = feature.href
              ? { href: sanitizeHref(feature.href) }
              : {};
            return (
              <Tag
                key={feature.id}
                {...linkProps}
                onPointerMove={(event: PointerEvent<HTMLElement>) => {
                  if (event.pointerType === "touch" || reducedMotion.current)
                    return;
                  const box = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty(
                    "--g5-x",
                    `${event.clientX - box.left}px`,
                  );
                  event.currentTarget.style.setProperty(
                    "--g5-y",
                    `${event.clientY - box.top}px`,
                  );
                }}
                className={`group relative isolate flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#181a1c] p-6 transition-[border-color] hover:border-white/30 focus-visible:border-[var(--g5-accent)] motion-reduce:transition-none ${
                  feature.href ? "focus-visible:outline-offset-4" : ""
                } ${
                  feature.size === "wide"
                    ? "sm:col-span-2"
                    : feature.size === "tall"
                      ? "sm:row-span-2"
                      : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(340px circle at var(--g5-x, 50%) var(--g5-y, 50%), color-mix(in srgb, var(--g5-accent) 12%, transparent), transparent 80%)",
                  }}
                />
                <div>
                  <p className="font-mono text-[10px] text-[var(--g5-accent)] uppercase">
                    {feature.eyebrow}
                  </p>
                  <h3 className="mt-5 text-2xl font-medium tracking-[-.04em]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#b4b6af]">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-8 flex min-h-12 items-end justify-between gap-4">
                  {feature.visual && <div>{feature.visual}</div>}
                  {feature.href && (
                    <span className="ms-auto inline-flex items-center gap-2 text-xs text-[#c2c4bd]">
                      {feature.linkLabel ?? "Explore"}
                      <span
                        aria-hidden="true"
                        className="text-[var(--g5-accent)]"
                      >
                        ↗
                      </span>
                    </span>
                  )}
                </div>
              </Tag>
            );
          })}
        </div>
      )}
    </section>
  );
}
