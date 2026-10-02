import type { Metadata } from "next";
import Link from "next/link";
import { components, templates } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Find the right blocks",
  description:
    "Choose Gear5 blocks by the job your portfolio or product page needs to do.",
  alternates: { canonical: "/use-cases" },
};

const paths = [
  {
    number: "01",
    title: "Make a confident first impression",
    description:
      "Lead with one clear promise, a strong visual, and a next step people can act on.",
    blocks: ["orbit-hero"],
  },
  {
    number: "02",
    title: "Show a body of work",
    description:
      "Help people scan several projects, then open the story behind the one that interests them.",
    blocks: ["project-gallery", "project-showcase"],
  },
  {
    number: "03",
    title: "Explain a product or process",
    description:
      "Make the important parts easy to compare, whether they need a guided reveal or a quick overview.",
    blocks: ["spotlight-bento", "feature-switcher"],
  },
  {
    number: "04",
    title: "Make the offer clear",
    description:
      "Show what each plan costs and what customers get, with real values supplied by you.",
    blocks: ["pricing-switch"],
  },
  {
    number: "05",
    title: "Add a human voice",
    description:
      "Share a real quote or a short client note. Keep attribution and permission with your team.",
    blocks: ["testimonial-deck"],
  },
];

export default function UseCasesPage() {
  return (
    <main id="main" className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8">
      <p className="eyebrow">A useful place to start / Collection 01</p>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
        <div>
          <h1 className="max-w-4xl text-5xl font-medium tracking-[-.065em] sm:text-7xl">
            What does your page need to do<span className="text-coral">?</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-smoke">
            Start with the job, then choose a block. Each preview has editable
            copy, install instructions, and the source you can make your own.
          </p>
        </div>
        <Link href="/templates/portfolio" className="button-secondary w-fit">
          Need a whole portfolio? <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <ol className="mt-14 divide-y divide-hairline border-y border-hairline">
        {paths.map((path) => (
          <li
            key={path.number}
            className="grid gap-5 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(13rem,.75fr)] sm:items-start"
          >
            <span className="font-mono text-xs text-coral">{path.number}</span>
            <div>
              <h2 className="text-xl font-medium tracking-[-.03em]">
                {path.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-smoke">
                {path.description}
              </p>
            </div>
            <ul
              aria-label={`Suggested blocks for ${path.title}`}
              className="flex flex-wrap gap-2 sm:justify-end"
            >
              {path.blocks.map((name) => {
                const item = components.find((component) => component.name === name);
                if (!item) return null;
                return (
                  <li key={name}>
                    <Link
                      href={`/components/${item.name}`}
                      className="button-secondary !min-h-9 !px-3 !py-2 !text-xs"
                    >
                      {item.title} <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <section className="mt-12 rounded-2xl border border-hairline bg-anvil p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <div>
          <p className="eyebrow">A complete starting point</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-.04em]">
            {templates[0]?.title ?? "Folio 01"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-smoke">
            A working portfolio composition with replaceable content, contact
            details, and installation notes.
          </p>
        </div>
        <Link href="/templates/portfolio" className="button-primary mt-6 w-fit sm:mt-0">
          Explore the template <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <p className="mt-8 text-xs leading-6 text-smoke">
        Quotes, project details, prices, and artwork in these blocks should be
        your own and accurate to your work.
      </p>
    </main>
  );
}
