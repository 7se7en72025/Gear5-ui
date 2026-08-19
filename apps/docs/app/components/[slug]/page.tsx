import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyCode } from "@/components/copy-code";
import { Demo } from "@/components/demo-registry";
import { CATALOG, getEntry } from "@/lib/catalog";
import { InstallCommand } from "../../_components/install-command";
import { getComponent, installCommandFor } from "../../_components/registry";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return CATALOG.map((entry) => ({ slug: entry.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const entry = getEntry(params.slug);
  if (!entry) return { title: "Not found" };
  return { title: entry.name, description: entry.tagline };
}

export default function ComponentPage({ params }: Props) {
  const entry = getEntry(params.slug);
  if (!entry) notFound();

  const registryEntry = getComponent(params.slug);
  const index = CATALOG.findIndex((e) => e.slug === entry.slug);
  const prev = index > 0 ? CATALOG[index - 1] : undefined;
  const next = index < CATALOG.length - 1 ? CATALOG[index + 1] : undefined;

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <Link
        href="/components"
        className="text-[13px] text-fg-faint transition-colors hover:text-fg"
      >
        ← All components
      </Link>

      <header className="mt-6">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
          {entry.category}
        </p>
        <h1 className="text-3xl">{entry.name}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-fg-muted">
          {entry.tagline}
        </p>
      </header>

      <section className="mt-10">
        <InstallCommand command={installCommandFor(entry.slug)} />
        {registryEntry?.headless ? (
          <p className="mt-3 text-[13px] text-fg-faint">
            Styled on top of the headless{" "}
            <code className="rounded bg-panel-raised px-1.5 py-0.5 font-mono text-[12px]">
              @gear5/core
            </code>{" "}
            primitive, which owns the behaviour and accessibility.
          </p>
        ) : null}
      </section>

      <section className="mt-14">
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
          Preview
        </h2>
        <div className="rounded-panel border border-line bg-panel p-6">
          <Demo slug={entry.slug} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl">Why it exists</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
          {entry.why}
        </p>
      </section>

      {entry.details.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-xl">Decisions</h2>
          <ul className="mt-4 space-y-3">
            {entry.details.map((detail) => (
              <li
                key={detail}
                className="flex gap-3 text-[15px] leading-relaxed text-fg-muted"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-px w-4 shrink-0 bg-line-strong"
                />
                {detail}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="text-xl">Usage</h2>
        <div className="mt-4">
          <CopyCode code={entry.example} />
        </div>
      </section>

      {entry.props.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-xl">Props</h2>
          <div className="mt-4 overflow-x-auto rounded-panel border border-line">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-panel-raised">
                  <th className="px-4 py-3 font-medium">Prop</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Default</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {entry.props.map((prop) => (
                  <tr key={prop.name} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-accent">
                      {prop.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-fg-muted">
                      {prop.type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-fg-faint">
                      {prop.default ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <nav
        aria-label="Component"
        className="mt-16 flex items-stretch justify-between gap-4 border-t border-line pt-8"
      >
        {prev ? (
          <Link
            href={`/components/${prev.slug}`}
            className="group flex-1 rounded-panel border border-line p-4 transition-colors hover:border-line-strong"
          >
            <span className="text-[11px] uppercase tracking-wider text-fg-faint">
              Previous
            </span>
            <span className="mt-1 block text-[15px] group-hover:text-accent">
              {prev.name}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/components/${next.slug}`}
            className="group flex-1 rounded-panel border border-line p-4 text-right transition-colors hover:border-line-strong"
          >
            <span className="text-[11px] uppercase tracking-wider text-fg-faint">
              Next
            </span>
            <span className="mt-1 block text-[15px] group-hover:text-accent">
              {next.name}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </main>
  );
}
