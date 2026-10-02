"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export interface SwitcherFeature {
  id: string;
  label: string;
  title: string;
  description: string;
  visual?: ReactNode;
}
const defaults: SwitcherFeature[] = [
  {
    id: "strategy",
    label: "Strategy",
    title: "Find the right direction.",
    description:
      "Start with the people, the problem, and the possibility. A clear foundation for everything that follows.",
  },
  {
    id: "design",
    label: "Design",
    title: "Make every detail count.",
    description:
      "A considered visual language, thoughtful interactions, and an experience that feels unmistakably yours.",
  },
  {
    id: "build",
    label: "Development",
    title: "Bring it into the real world.",
    description:
      "Responsive, accessible, and ready to ship. Crafted in code with the same care as the first sketch.",
  },
];
export interface FeatureSwitcherProps {
  features?: SwitcherFeature[];
  title?: string;
  eyebrow?: string;
  accent?: string;
  className?: string;
}

/** Tabs use roving focus; arrows follow the computed writing direction. */
export function FeatureSwitcher({
  features = defaults,
  title = "From the first idea to the final pixel.",
  eyebrow = "How I work",
  accent = "#d9fc87",
  className = "",
}: FeatureSwitcherProps) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const active = Math.min(selected, Math.max(0, features.length - 1));
  const feature = features[active];
  return (
    <section
      style={{ "--g5-accent": accent } as CSSProperties}
      className={`rounded-3xl bg-[#111214] p-6 text-[#f4f4ef] sm:p-10 ${className}`}
    >
      <p className="font-mono text-[11px] tracking-[.12em] text-[#b4b6af] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-.05em] sm:text-4xl">
        {title}
      </h2>
      {feature && (
        <>
          <div
            role="tablist"
            aria-label={title}
            className="mt-8 flex flex-wrap gap-2"
          >
            {features.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  buttons.current[index] = node;
                }}
                id={`${id}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-controls={`${id}-panel`}
                tabIndex={active === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  const rtl =
                    getComputedStyle(event.currentTarget).direction === "rtl";
                  let next: number;
                  if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = features.length - 1;
                  else if (event.key === "ArrowRight")
                    next =
                      (index + (rtl ? -1 : 1) + features.length) %
                      features.length;
                  else if (event.key === "ArrowLeft")
                    next =
                      (index + (rtl ? 1 : -1) + features.length) %
                      features.length;
                  else return;
                  event.preventDefault();
                  setSelected(next);
                  buttons.current[next]?.focus();
                }}
                className={`min-h-11 rounded-full border px-5 py-2 text-sm transition-colors motion-reduce:transition-none ${active === index ? "border-transparent bg-[var(--g5-accent)] text-[#111214]" : "border-white/20 text-[#c2c4bd] hover:bg-white/5"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${active}`}
            tabIndex={0}
            className="mt-5 grid items-center gap-6 rounded-2xl border border-white/15 bg-[#181a1c] p-6 sm:grid-cols-2"
          >
            <div>
              <p
                aria-hidden="true"
                className="mb-6 font-mono text-xs text-[var(--g5-accent)]"
              >
                0{active + 1} / 0{features.length}
              </p>
              <h3 className="text-2xl font-medium tracking-[-.04em]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#b4b6af]">
                {feature.description}
              </p>
            </div>
            {feature.visual ?? (
              <div
                aria-hidden="true"
                className="flex aspect-[4/3] items-end gap-3 rounded-xl bg-[#232629] p-8"
              >
                {[35, 65, 48, 90, 72].map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${((height + active * 19) % 75) + 20}%` }}
                    className={`flex-1 rounded-t-lg transition-[height] duration-500 motion-reduce:transition-none ${i === active + 1 ? "bg-[var(--g5-accent)]" : "bg-white/15"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
