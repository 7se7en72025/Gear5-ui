"use client";
import { useState } from "react";
import { OrbitHero } from "@/registry/gear5/ui/orbit-hero";
import { ProjectShowcase } from "@/registry/gear5/ui/project-showcase";
import { FeatureSwitcher } from "@/registry/gear5/ui/feature-switcher";
import { PricingSwitch } from "@/registry/gear5/ui/pricing-switch";
import { TestimonialDeck } from "@/registry/gear5/ui/testimonial-deck";
import { Copyable } from "./copyable";
const options = [
  { label: "Lime", color: "#d9fc87" },
  { label: "Lavender", color: "#d3c8ff" },
  { label: "Peach", color: "#ffcbaa" },
];
export function Preview({
  name,
  showControls = false,
}: {
  name: string;
  showControls?: boolean;
}) {
  const [accent, setAccent] = useState(options[0].color);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState(0);
  const Block = {
    "orbit-hero": OrbitHero,
    "project-showcase": ProjectShowcase,
    "feature-switcher": FeatureSwitcher,
    "pricing-switch": PricingSwitch,
    "testimonial-deck": TestimonialDeck,
  }[name];
  if (!Block) return null;
  const exportName = {
    "orbit-hero": "OrbitHero",
    "project-showcase": "ProjectShowcase",
    "feature-switcher": "FeatureSwitcher",
    "pricing-switch": "PricingSwitch",
    "testimonial-deck": "TestimonialDeck",
  }[name];
  const usage = `import { ${exportName} } from "@/components/gear5/${name}";\n\nexport default function Example() {\n  return <${exportName} accent={${JSON.stringify(accent)}}${title ? ` title={${JSON.stringify(title)}}` : ""} />;\n}`;
  return (
    <div className="min-w-0">
      {showControls && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-hairline bg-anvil p-4">
          <fieldset className="flex gap-2">
            <legend className="mb-2 font-mono text-[10px] text-smoke uppercase">
              Accent
            </legend>
            {options.map((option) => (
              <label
                key={option.color}
                className="cursor-pointer rounded-full focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white"
              >
                <input
                  type="radio"
                  name={`${name}-accent`}
                  className="sr-only"
                  checked={accent === option.color}
                  onChange={() => setAccent(option.color)}
                />
                <span
                  className={`block rounded-full border px-3 py-2 text-xs ${accent === option.color ? "border-cream" : "border-hairline"}`}
                  style={{ color: option.color }}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </fieldset>
          <label className="flex-1 sm:max-w-72">
            <span className="mb-2 block font-mono text-[10px] text-smoke uppercase">
              Heading
            </span>
            <input
              aria-label="Preview heading"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Try your own headline…"
              className="min-h-10 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm"
            />
          </label>
          <button
            type="button"
            className="min-h-10 rounded-lg border border-hairline px-3 text-xs text-smoke"
            onClick={() => {
              setTitle("");
              setAccent(options[0].color);
              setVersion(version + 1);
            }}
          >
            Reset preview
          </button>
        </div>
      )}
      <Block key={version} accent={accent} {...(title ? { title } : {})} />
      {showControls && (
        <div className="mt-4">
          <Copyable value={usage} label="Copy customized usage" block />
        </div>
      )}
    </div>
  );
}
