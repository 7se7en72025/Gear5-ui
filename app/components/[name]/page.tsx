import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copyable } from "@/components/site/copyable";
import { Preview } from "@/components/site/preview";
import {
  components,
  getItem,
  installCommand,
  resolveDependencies,
  TIER_BUDGETS,
} from "@/lib/registry";
import { readSource } from "@/lib/source";
import { EXAMPLES, BLOCK_NOTES } from "@/lib/doc-examples";
export function generateStaticParams() {
  return components.map((item) => ({ name: item.name }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const item = getItem(name);
  return item?.type === "registry:ui"
    ? {
        title: item.title,
        description: item.description,
        alternates: { canonical: `/components/${name}` },
      }
    : {};
}
export default async function ComponentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = getItem(name);
  if (!item || item.type !== "registry:ui") notFound();
  const source = await readSource(item);
  const dependencies = await Promise.all(
    resolveDependencies(name).map(async (name) => {
      const item = getItem(name)!;
      return { item, source: await readSource(item) };
    }),
  );
  return (
    <main
      id="main"
      className="mx-auto grid max-w-[1320px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[180px_minmax(0,1fr)]"
    >
      <aside className="h-fit lg:sticky lg:top-28">
        <Link href="/components" className="text-xs text-smoke">
          ← The collection
        </Link>
        <nav
          aria-label="Components"
          className="mt-6 flex flex-wrap gap-2 lg:flex-col"
        >
          {components.map((block) => (
            <Link
              key={block.name}
              href={`/components/${block.name}`}
              aria-current={name === block.name ? "page" : undefined}
              className={`rounded-lg px-3 py-2.5 text-xs ${name === block.name ? "bg-coral/10 text-coral" : "text-smoke hover:text-cream"}`}
            >
              {block.title}
            </Link>
          ))}
        </nav>
        <p className="mt-8 hidden font-mono text-[10px] leading-6 text-smoke lg:block">
          REACT + TAILWIND
          <br />
          SOURCE YOU OWN.
        </p>
      </aside>
      <article className="min-w-0">
        <p className="eyebrow">Collection 01 / Interactive</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-.065em] sm:text-6xl">
          {item.title}
          <span className="text-coral">.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-smoke">
          {item.description}
        </p>
        <section className="mt-9" aria-labelledby="preview-title">
          <h2
            id="preview-title"
            className="mb-4 font-mono text-[10px] tracking-[.14em] text-smoke uppercase"
          >
            Live playground
          </h2>
          <Preview name={name} showControls />
        </section>
        <section id="install" className="mt-10">
          <h2 className="mb-4 text-xl font-medium">Make it yours.</h2>
          <Copyable value={installCommand(name)} label="Copy install command" />
          <p className="mt-3 text-xs leading-6 text-smoke">
            Copies editable source into your project.{" "}
            <Link href="/getting-started" className="text-coral underline">
              Setup guide
            </Link>{" "}
            · React and Tailwind CSS 4 required.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-medium">Put it to work.</h2>
          <Copyable
            value={EXAMPLES[name]}
            label={`Copy ${item.title} usage`}
            block
          />
        </section>
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-medium">Good to know.</h2>
          <ul className="space-y-3 text-sm leading-7 text-smoke">
            {BLOCK_NOTES[name]?.map((note) => (
              <li key={note} className="border-s border-coral/30 ps-4">
                {note}
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-medium">Source & props.</h2>
          <p className="mb-4 text-xs leading-6 text-smoke">
            Installer-ready imports. For manual installation, copy this file
            into components/gear5/{name}.tsx and add the helpers below at their
            shown paths.
          </p>
          <Copyable value={source} label={`Copy ${item.title} source`} block />
          {dependencies.map(({ item, source }) => (
            <details
              key={item.name}
              className="mt-4 rounded-xl border border-hairline p-4"
            >
              <summary className="cursor-pointer text-xs text-smoke">
                Helper: {item.name} → lib/gear5/
                {item.files[0].path.split("/").pop()}
              </summary>
              <div className="mt-4">
                <Copyable
                  value={source}
                  label={`Copy ${item.title} helper`}
                  block
                />
              </div>
            </details>
          ))}
        </section>
        <p className="mt-10 border-t border-hairline pt-5 font-mono text-[10px] leading-6 text-smoke">
          VERIFIED: AXE FIXTURES / SERVER RENDER / SOURCE SCANS /{" "}
          {TIER_BUDGETS[item.tier!]} B GZIP CEILING
          <br />
          Test your own content and screen-reader flows before shipping.
        </p>
      </article>
    </main>
  );
}
