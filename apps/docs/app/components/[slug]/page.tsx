import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OnePieceBackground } from "@gear5/core";

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
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-24">
      <div className="mx-auto max-w-[900px]">
        <Link
          href="/components"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Back to components
        </Link>

        <h1 className="mt-6 text-4xl font-bold tracking-[-0.02em] text-white">
          {entry.title}
        </h1>
        <p className="mt-3 max-w-[560px] text-neutral-400">
          {entry.description}
        </p>

        <div className="mt-8">
          <InstallCommand command={installCommandFor(entry.slug)} />
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.08]">
          <OnePieceBackground className="h-[480px]">
            <div className="flex h-[480px] flex-col items-center justify-center px-6 text-center text-white">
              <h2 className="text-4xl font-bold">Grand Line Awaits</h2>
              <p className="mt-2 text-white/80">
                Sample content over the animated background
              </p>
            </div>
          </OnePieceBackground>
        </div>
      </div>
    </main>
  );
}
