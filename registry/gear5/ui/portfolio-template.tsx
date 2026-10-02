"use client";

import { useId, type CSSProperties } from "react";
import { OrbitHero } from "./orbit-hero";
import { ProjectGallery, type GalleryProject } from "./project-gallery";
import { SpotlightBento, type BentoFeature } from "./spotlight-bento";
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
  projects?: GalleryProject[];
  process?: BentoFeature[];
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

const projectsDefault: GalleryProject[] = [
  {
    id: "forma",
    title: "Forma",
    category: "Identity",
    description:
      "A new visual language for an architecture studio, made to grow.",
    artworkAlt: "Abstract pale sage identity artwork marked f.",
    artwork: (
      <div className="flex aspect-[5/4] items-center justify-center bg-[#d5e6d3] font-serif text-8xl text-[#283329]">
        f.
      </div>
    ),
    href: "#contact",
    linkLabel: "Discuss a similar project",
  },
  {
    id: "mono",
    title: "Mono",
    category: "Product",
    description: "Turning a busy creative workflow into a calmer workspace.",
    artworkAlt: "Abstract lavender product artwork marked m.",
    artwork: (
      <div className="flex aspect-[5/4] items-center justify-center bg-[#c9c4e4] font-mono text-7xl text-[#302b48]">
        m↗
      </div>
    ),
    href: "#contact",
    linkLabel: "Discuss a similar project",
  },
  {
    id: "terrain",
    title: "Terrain",
    category: "Digital",
    description: "An independent publication for the places in between.",
    artworkAlt: "Warm sand-colored publication artwork marked t.",
    artwork: (
      <div className="flex aspect-[5/4] items-center justify-center bg-[#ead3b9] font-serif text-7xl italic text-[#49362b]">
        t*
      </div>
    ),
    href: "#contact",
    linkLabel: "Discuss a similar project",
  },
];

/** Complete sample portfolio with an editable gallery and process grid. Replace sample content before publishing. */
export function PortfolioTemplate({
  name = "Alex Morgan",
  initials = "am.",
  accent = "#d9fc87",
  email = "hello@example.com",
  title = "Thoughtful design.\nUnexpected details.",
  description = "I’m Alex, an independent designer and developer turning ambitious ideas into digital experiences people love.",
  availability = "Available for select projects",
  projects = projectsDefault,
  process: processFeatures,
  testimonials = deckTestimonials,
  projectLinkLabel = "Discuss a similar project",
  services = servicesDefault,
  labels = {},
}: PortfolioTemplateProps) {
  const id = useId().replace(/:/g, "");
  const work = `${id}-work`,
    processId = `${id}-process`,
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
            <a href={`#${processId}`}>{labels.process ?? "Process"}</a>
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
          <ProjectGallery
            accent={accent}
            title="A few things I’ve made."
            eyebrow={labels.work ?? "Selected work"}
            projects={projects.map((project) => ({
              ...project,
              linkLabel: project.linkLabel ?? projectLinkLabel,
              href: project.href === "#contact" ? emailHref : project.href,
            }))}
          />
        </div>
        <div id={processId} className="mt-6 scroll-mt-24">
          <SpotlightBento
            accent={accent}
            eyebrow={labels.process ?? "How I work"}
            title="A considered path from first sketch to launch."
            features={processFeatures}
          />
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
