import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioTemplate } from "@/registry/gear5/ui/portfolio-template";
import { Copyable } from "@/components/site/copyable";
import { getItem, installCommand, resolveDependencies } from "@/lib/registry";
import { EXAMPLES } from "@/lib/doc-examples";
import { readSource } from "@/lib/source";
export const metadata: Metadata = {
  title: "Folio 01 — Portfolio template",
  alternates: { canonical: "/templates/portfolio" },
};
export default async function PortfolioPage() {
  const item = getItem("portfolio-template")!;
  const dependencies = await Promise.all(
    resolveDependencies(item.name).map(async (name) => {
      const item = getItem(name)!;
      return { item, source: await readSource(item) };
    }),
  );
  return (
    <main id="main" className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link href="/templates" className="text-xs text-smoke">
            ← Templates
          </Link>
          <h1 className="mt-5 text-5xl tracking-[-.065em]">
            Folio 01<span className="text-coral">.</span>
          </h1>
          <p className="mt-3 text-sm text-smoke">
            A complete canvas for your work. Made from the collection.
          </p>
        </div>
        <a href="#install" className="button-primary">
          Get the template <span aria-hidden="true">↓</span>
        </a>
      </div>
      <p className="mb-4 font-mono text-[10px] leading-6 text-smoke">
        LIVE PREVIEW / FICTIONAL DESIGNER, PROJECTS, PRICES & TESTIMONIALS
      </p>
      <div className="overflow-hidden rounded-3xl border border-hairline">
        <PortfolioTemplate />
      </div>
      <section id="install" className="mx-auto mt-14 max-w-3xl scroll-mt-28">
        <p className="eyebrow">Your turn.</p>
        <h2 className="mt-4 mb-5 text-3xl tracking-[-.05em]">
          Take the whole template.
        </h2>
        <Copyable
          value={installCommand("portfolio-template")}
          label="Copy portfolio template install command"
        />
        <p className="my-5 text-sm leading-7 text-smoke">
          Installs the page component, five blocks, and safe-link helper.
          Requires React and Tailwind CSS 4. Replace all example content before
          publishing; the service links open your configured email address.
        </p>
        <Copyable
          value={EXAMPLES["portfolio-template"]}
          label="Copy portfolio usage"
          block
        />
        <details className="mt-8 rounded-xl border border-hairline p-5">
          <summary className="cursor-pointer text-sm">
            Template source → components/gear5/portfolio-template.tsx
          </summary>
          <div className="mt-4">
            <Copyable
              value={await readSource(item)}
              label="Copy portfolio template source"
              block
            />
          </div>
        </details>
        {dependencies.map(({ item, source }) => (
          <details
            key={item.name}
            className="mt-4 rounded-xl border border-hairline p-5"
          >
            <summary className="cursor-pointer text-sm">
              {item.title} →{" "}
              {item.type === "registry:lib" ? "lib" : "components"}/gear5/
              {item.files[0].path.split("/").pop()}
            </summary>
            <div className="mt-4">
              <Copyable
                value={source}
                label={`Copy ${item.title} source`}
                block
              />
            </div>
          </details>
        ))}
        <Link href="/getting-started" className="button-secondary mt-7">
          Read the setup guide ↗
        </Link>
      </section>
    </main>
  );
}
