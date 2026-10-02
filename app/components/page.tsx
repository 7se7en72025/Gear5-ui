import type { Metadata } from "next";
import Link from "next/link";
import { Preview } from "@/components/site/preview";
import { components } from "@/lib/registry";
export const metadata: Metadata = {
  title: "Components",
  description:
    "Seven expressive React blocks for portfolio work, product stories, and their most useful details.",
  alternates: { canonical: "/components" },
};
export default function ComponentsPage() {
  return (
    <main id="main" className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8">
      <p className="eyebrow">Collection 01 / The essentials, with character.</p>
      <h1 className="mt-5 text-5xl font-medium tracking-[-.065em] sm:text-7xl">
        Pick your next move<span className="text-coral">.</span>
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-smoke">
        Seven original blocks. Real interactions. Open every preview, try the
        controls, then take the source with you.
      </p>
      <nav aria-label="Component index" className="mt-8 flex flex-wrap gap-2">
        {components.map((item) => (
          <a
            key={item.name}
            href={`#${item.name}`}
            className="button-secondary !min-h-9 !px-4 !py-2 !text-xs"
          >
            {item.title}
          </a>
        ))}
      </nav>
      <div className="mt-12 space-y-12">
        {components.map((item, i) => (
          <section key={item.name} id={item.name} className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-coral">0{i + 1}</span>
                <h2 className="text-lg font-medium">{item.title}</h2>
              </div>
              <Link
                href={`/components/${item.name}`}
                className="text-xs text-coral"
              >
                Customize & install ↗
              </Link>
            </div>
            <Preview name={item.name} />
          </section>
        ))}
      </div>
    </main>
  );
}
