"use client";

import { useId, useState, type CSSProperties } from "react";
import { sanitizeHref } from "../lib/sanitize";

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyNote: string;
  yearlyNote: string;
  features: string[];
  href: string;
  featured?: boolean;
}
const plansDefault: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "A little room to explore.",
    monthlyPrice: "$12",
    yearlyPrice: "$9",
    monthlyNote: "$12 billed each month",
    yearlyNote: "$108 billed once a year",
    features: ["3 active projects", "Unlimited ideas", "Community support"],
    href: "#contact",
  },
  {
    id: "studio",
    name: "Studio",
    description: "For your next big thing.",
    monthlyPrice: "$29",
    yearlyPrice: "$24",
    monthlyNote: "$29 billed each month",
    yearlyNote: "$288 billed once a year",
    features: ["Unlimited projects", "Shared workspaces", "Priority support"],
    href: "#contact",
    featured: true,
  },
];
export interface PricingSwitchProps {
  plans?: PricingPlan[];
  title?: string;
  eyebrow?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  billingLabel?: string;
  unitLabel?: string;
  actionLabel?: string;
  featuredLabel?: string;
  accent?: string;
  className?: string;
}

/** Prices and billing notes are explicit caller data; no checkout or automatic billing. */
export function PricingSwitch({
  plans = plansDefault,
  title = "Small start. Big possibilities.",
  eyebrow = "Simple pricing",
  monthlyLabel = "Monthly",
  yearlyLabel = "Yearly",
  billingLabel = "Billing period",
  unitLabel = "/ month",
  actionLabel = "Get started",
  featuredLabel = "Popular",
  accent = "#d9fc87",
  className = "",
}: PricingSwitchProps) {
  const id = useId();
  const [yearly, setYearly] = useState(false);
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
      <fieldset className="mt-7 flex w-fit gap-1 rounded-full border border-white/20 p-1">
        <legend className="sr-only">{billingLabel}</legend>
        {[
          [false, monthlyLabel],
          [true, yearlyLabel],
        ].map(([value, label]) => (
          <label
            key={String(value)}
            className={`relative cursor-pointer rounded-full px-5 py-2.5 text-sm transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white motion-reduce:transition-none ${yearly === value ? "bg-[var(--g5-accent)] text-[#111214]" : "text-[#c2c4bd]"}`}
          >
            <input
              type="radio"
              name={`${id}-billing`}
              checked={yearly === value}
              onChange={() => setYearly(Boolean(value))}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border p-6 ${plan.featured ? "border-[var(--g5-accent)] bg-[#1b2017]" : "border-white/15 bg-[#181a1c]"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium">{plan.name}</h3>
              {plan.featured && (
                <span className="rounded-full bg-[var(--g5-accent)] px-3 py-1 text-[10px] font-semibold text-[#111214]">
                  {featuredLabel}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#b4b6af]">{plan.description}</p>
            <div aria-live="polite" aria-atomic="true" className="my-7">
              <p className="text-sm text-[#b4b6af]">
                <span className="me-2 text-5xl font-medium tracking-[-.06em] text-[#f4f4ef]">
                  {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {unitLabel}
              </p>
              <p className="mt-3 text-xs text-[#b4b6af]">
                {yearly ? plan.yearlyNote : plan.monthlyNote}
              </p>
            </div>
            <ul className="mb-7 space-y-3 text-sm text-[#d5d6cf]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span aria-hidden="true" className="text-[var(--g5-accent)]">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={sanitizeHref(plan.href)}
              className={`mt-auto flex min-h-11 items-center justify-between rounded-full px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80 motion-reduce:transition-none ${plan.featured ? "bg-[var(--g5-accent)] text-[#111214]" : "border border-white/20 text-[#f4f4ef]"}`}
            >
              {actionLabel}
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
