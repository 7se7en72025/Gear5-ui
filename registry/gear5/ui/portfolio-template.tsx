"use client";

import { useId, type CSSProperties } from "react";
import { OrbitHero } from "./orbit-hero";
import {
  ProjectShowcase,
  showcaseProjects,
  type ShowcaseProject,
} from "./project-showcase";
import { FeatureSwitcher } from "./feature-switcher";
import { PricingSwitch, type PricingPlan } from "./pricing-switch";
import {
  TestimonialDeck,
  deckTestimonials,
  type DeckTestimonial,
} from "./testimonial-deck";
import { sanitizeHref } from "../lib/sanitize";

export interface PortfolioTemplateProps {
  name?: string;
  initials?: string;
  accent?: string;
  email?: string;
  title?: string;
  description?: string;
  availability?: string;
  projects?: ShowcaseProject[];
  testimonials?: DeckTestimonial[];
  projectLinkLabel?: string;
  services?: PricingPlan[];
  labels?: {
    work?: string;
    process?: string;
    services?: string;
    contact?: string;
    contactEyebrow?: string;
    contactTitle?: string;
    footer?: string;
  };
}
const servicesDefault: PricingPlan[] = [
  {
    id: "design",
    name: "Design partner",
    description: "For a considered visual direction.",
    monthlyPrice: "$1,200",
    yearlyPrice: "$1,000",
    monthlyNote: "Monthly design retainer",
    yearlyNote: "$12,000 billed yearly",
    features: [
      "Brand & interface design",
      "One request at a time",
      "Direct collaboration",
    ],
    href: "#contact",
  },
  {
    id: "full",
    name: "Design + development",
    description: "From the first idea to a live site.",
    monthlyPrice: "$2,400",
    yearlyPrice: "$2,000",
    monthlyNote: "Monthly design & development retainer",
    yearlyNote: "$24,000 billed yearly",
    features: [
      "Everything in design",
      "React & Next.js development",
      "Launch support",
    ],
    href: "#contact",
    featured: true,
  },
];

/** Complete sample portfolio. Replace the fictional content and pricing before publishing. */
export function PortfolioTemplate({
  name = "Alex Morgan",
  initials = "am.",
  accent = "#d9fc87",
  email = "hello@example.com",
  title = "Thoughtful design.\nUnexpected details.",
  description = "I’m Alex, an independent designer and developer turning ambitious ideas into digital experiences people love.",
  availability = "Available for select projects",
  projects = showcaseProjects,
  testimonials = deckTestimonials,
  projectLinkLabel = "Discuss a similar project",
  services = servicesDefault,
  labels = {},
}: PortfolioTemplateProps) {
  const id = useId().replace(/:/g, "");
  const work = `${id}-work`,
    process = `${id}-process`,
    pricing = `${id}-services`,
    contact = `${id}-contact`;
  const emailHref = sanitizeHref(`mailto:${email}`);
  return (
    <div
      style={{ "--g5-accent": accent } as CSSProperties}
      className="bg-[#0b0c0e] p-4 text-[#f4f4ef] sm:p-8"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 px-3 py-3">
          <a
            href={`#${id}-home`}
            aria-label={name}
            className="font-serif text-3xl font-bold tracking-[-.06em]"
          >
            {initials}
          </a>
          <nav
            aria-label={name}
            className="flex flex-wrap gap-5 text-xs text-[#c2c4bd]"
          >
            <a href={`#${work}`}>{labels.work ?? "Work"}</a>
            <a href={`#${process}`}>{labels.process ?? "Process"}</a>
            <a href={`#${pricing}`}>{labels.services ?? "Services"}</a>
            <a href={`#${contact}`} className="text-[var(--g5-accent)]">
              {labels.contact ?? "Let’s talk"} ↗
            </a>
          </nav>
        </header>
        <div id={`${id}-home`}>
          <OrbitHero
            headingLevel="h1"
            eyebrow={availability}
            title={title}
            description={description}
            mark={initials}
            accent={accent}
            action={{ label: labels.work ?? "Selected work", href: `#${work}` }}
            secondaryAction={{
              label: labels.contact ?? "Let’s talk",
              href: `#${contact}`,
            }}
          />
        </div>
        <div id={work} className="mt-6 scroll-mt-24">
          <ProjectShowcase
            accent={accent}
            projects={projects.map((project) => ({
              ...project,
              href: project.href === "#contact" ? emailHref : project.href,
            }))}
            linkLabel={projectLinkLabel}
          />
        </div>
        <div id={process} className="mt-6 scroll-mt-24">
          <FeatureSwitcher accent={accent} />
        </div>
        <div id={pricing} className="mt-6 scroll-mt-24">
          <PricingSwitch
            title="A good fit for your next chapter."
            eyebrow={labels.services ?? "Ways to work together"}
            accent={accent}
            plans={services.map((plan) => ({
              ...plan,
              href: plan.href === "#contact" ? emailHref : plan.href,
            }))}
            actionLabel={labels.contact ?? "Let’s talk"}
          />
        </div>
        <div className="mt-6">
          <TestimonialDeck testimonials={testimonials} accent={accent} />
        </div>
        <section
          id={contact}
          className="mt-6 scroll-mt-24 rounded-3xl bg-[var(--g5-accent)] p-8 text-[#111214] sm:p-12"
        >
          <p className="font-mono text-xs uppercase">
            {labels.contactEyebrow ?? "Something in mind?"}
          </p>
          <h2 className="mt-4 text-4xl font-medium tracking-[-.06em] sm:text-6xl">
            {labels.contactTitle ?? "Let’s make it happen."}
          </h2>
          <a
            href={emailHref}
            className="mt-8 inline-flex min-h-11 items-center gap-8 rounded-full border border-black/30 px-6 py-3 text-sm font-semibold"
          >
            {email}
            <span aria-hidden="true">↗</span>
          </a>
        </section>
        <footer className="flex flex-wrap justify-between gap-3 px-3 pt-8 text-xs text-[#b4b6af]">
          <span>{name}</span>
          <span>{labels.footer ?? "Made with care. Built with Gear5."}</span>
        </footer>
      </div>
    </div>
  );
}
