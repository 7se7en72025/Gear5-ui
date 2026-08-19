import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { components } from "../_components/registry";

export const metadata: Metadata = {
  title: "Components",
  description: "Every component in Gear5 UI, installable with the shadcn CLI.",
};

export default function ComponentsIndex() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-24">
      <div className="mx-auto max-w-[900px]">
        <Link
          href="/"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 text-4xl font-bold tracking-[-0.02em] text-white">
          Components
        </h1>
        <p className="mt-3 max-w-[520px] text-neutral-400">
          Every component is installable with the shadcn CLI and lands in your
          project as plain source you own.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {components.map((entry) => (
            <Link
              key={entry.slug}
              href={`/components/${entry.slug}`}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  {entry.title}
                </h2>
                <ArrowRight className="h-4 w-4 shrink-0 text-neutral-600 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {entry.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
