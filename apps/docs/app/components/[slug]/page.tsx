import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Demo } from "@/components/demo-registry";
import { InstallCommand } from "../../_components/install-command";
import {
  components,
  getComponent,
  installCommandFor,
} from "../../_components/registry";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return components.map((entry) => ({ slug: entry.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const entry = getComponent(params.slug);
  if (!entry) return { title: "Not found" };
  return { title: entry.title, description: entry.description };
}

export default function ComponentPage({ params }: Props) {
  const entry = getComponent(params.slug);
  if (!entry) notFound();

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-[900px]">
        <Link
          href="/components"
          className="text-sm text-fg-faint transition-colors hover:text-fg"
        >
          ← Back to components
        </Link>

        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.02em]">
          {entry.title}
        </h1>
        <p className="mt-3 max-w-[560px] text-fg-muted">{entry.description}</p>

        {entry.headless ? (
          <p className="mt-4 max-w-[560px] text-sm text-fg-faint">
            Styled on top of the headless{" "}
            <code className="rounded bg-panel-raised px-1.5 py-0.5 font-mono text-[13px]">
              @gear5/core
            </code>{" "}
            primitive, which handles the behaviour and accessibility.
          </p>
        ) : null}

        <div className="mt-8">
          <InstallCommand command={installCommandFor(entry.slug)} />
        </div>

        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-fg-faint">
            Preview
          </h2>
          <div className="rounded-panel border border-line bg-panel p-6">
            <Demo slug={entry.slug} />
          </div>
        </section>
      </div>
    </main>
  );
}
