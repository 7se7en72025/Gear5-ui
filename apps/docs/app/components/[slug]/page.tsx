import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOG, CATEGORIES, getEntry } from "@/lib/catalog";
import { Demo } from "@/components/demo-registry";
import { CodeBlock } from "@/registry/code-block";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATALOG.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};

  return {
    title: entry.name,
    description: entry.tagline,
  };
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const index = CATALOG.findIndex((item) => item.slug === slug);
  const previous = CATALOG[index - 1];
  const next = CATALOG[index + 1];

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-fg-muted">
        <Link href="/components" className="transition-colors hover:text-fg">
          Components
        </Link>
        <span aria-hidden="true" className="px-2 text-fg-faint">
          /
        </span>
        <span className="text-fg">{entry.name}</span>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl">{entry.name}</h1>
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-fg-muted">
            {CATEGORIES[entry.category].label}
          </span>
        </div>
        <p className="mt-3 text-lg text-fg-muted">{entry.tagline}</p>
      </header>

      <section aria-labelledby="demo-heading" className="mt-10">
        <h2 id="demo-heading" className="sr-only">
          Live demo
        </h2>
        <div className="rounded-panel border border-line bg-bg-subtle p-5 sm:p-8">
          <Demo slug={entry.slug} />
        </div>
      </section>

      <section aria-labelledby="install-heading" className="mt-12">
        <h2 id="install-heading" className="text-lg">
          Install
        </h2>
        <p className="mt-2 text-[15px] text-fg-muted">
          Copy the styled version into your project, or import the headless
          primitive and style it yourself.
        </p>
        <div className="mt-4 space-y-3">
          <CodeBlock
            code={`npx shadcn@latest add https://handoff-ui.dev/r/${entry.slug}.json`}
            language="bash"
            bare
          />
          <CodeBlock code="pnpm add handoff-ui" language="bash" bare />
        </div>
      </section>

      <section aria-labelledby="usage-heading" className="mt-12">
        <h2 id="usage-heading" className="text-lg">
          Usage
        </h2>
        <div className="mt-4">
          <CodeBlock code={entry.example} language="tsx" filename={`${entry.slug}.tsx`} />
        </div>
      </section>

      <section aria-labelledby="why-heading" className="mt-12">
        <h2 id="why-heading" className="text-lg">
          Why it exists
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fg-muted">
          {entry.why}
        </p>
      </section>

      <section aria-labelledby="details-heading" className="mt-12">
        <h2 id="details-heading" className="text-lg">
          What it gets right
        </h2>
        <ul className="mt-4 space-y-3">
          {entry.details.map((detail) => (
            <li key={detail} className="flex gap-3 text-[15px] leading-relaxed">
              <span
                aria-hidden="true"
                className="mt-2 size-1 shrink-0 rounded-full bg-accent"
              />
              <span className="text-fg-muted">{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="props-heading" className="mt-12">
        <h2 id="props-heading" className="text-lg">
          Props
        </h2>
        <p className="mt-2 text-[15px] text-fg-muted">
          The root takes these. Every part also accepts the usual attributes for
          its element, plus asChild.
        </p>

        <div className="mt-4 overflow-x-auto rounded-panel border border-line">
          <table className="w-full min-w-[38rem] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-panel">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Prop
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Type
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Default
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {entry.props.map((prop) => (
                <tr key={prop.name} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-fg">
                    {prop.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-accent">
                    {prop.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-fg-faint">
                    {prop.default ?? ""}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <nav
        aria-label="Pagination"
        className="mt-16 flex gap-4 border-t border-line pt-6"
      >
        {previous ? (
          <Link
            href={`/components/${previous.slug}`}
            className="group flex flex-col gap-1 text-[13px]"
          >
            <span className="text-fg-faint">Previous</span>
            <span className="font-mono transition-colors group-hover:text-accent">
              {previous.name}
            </span>
          </Link>
        ) : null}

        {next ? (
          <Link
            href={`/components/${next.slug}`}
            className="group ml-auto flex flex-col gap-1 text-right text-[13px]"
          >
            <span className="text-fg-faint">Next</span>
            <span className="font-mono transition-colors group-hover:text-accent">
              {next.name}
            </span>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
