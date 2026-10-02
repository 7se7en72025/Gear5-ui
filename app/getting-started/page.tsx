import type { Metadata } from "next";
import Link from "next/link";
import { Copyable } from "@/components/site/copyable";
import { EXAMPLES } from "@/lib/doc-examples";
import { installCommand } from "@/lib/registry";
export const metadata: Metadata = {
  title: "Getting started",
  alternates: { canonical: "/getting-started" },
};
export default function GettingStarted() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <p className="eyebrow">From preview to your project.</p>
      <h1 className="mt-4 text-5xl font-medium tracking-[-.065em]">
        Start with one good block.
      </h1>
      <p className="mt-5 text-sm leading-7 text-smoke">
        Gear5 copies React source into your app. You own the files, the content,
        and the final result.
      </p>
      <section className="mt-12">
        <h2 className="mb-4 text-xl">01 / Set the stage.</h2>
        <p className="mb-4 text-sm leading-7 text-smoke">
          Use a React application with Tailwind CSS 4. Configure shadcn with
          your import aliases; its setup command walks you through your existing
          project. Next.js is used for this site, but the blocks have no Next.js
          imports.
        </p>
        <Copyable
          value="npx shadcn@latest init"
          label="Copy shadcn setup command"
        />
        <p className="mt-3 text-sm text-smoke">
          Your global stylesheet should include:
        </p>
        <div className="mt-3">
          <Copyable
            value={'@import "tailwindcss";'}
            label="Copy Tailwind stylesheet import"
          />
        </div>
        <p className="mt-3 text-xs leading-6 text-smoke">
          The default aliases use @/components and @/lib. Follow your app’s
          Tailwind setup so its stylesheet is loaded and component files are
          scanned.
        </p>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 text-xl">02 / Bring it in.</h2>
        <Copyable
          value={installCommand("orbit-hero")}
          label="Copy Orbit Hero install command"
        />
        <p className="mt-3 text-sm leading-7 text-smoke">
          The registry installs the block and required helpers. Read the
          generated paths in the CLI output; with default aliases the block
          lands in components/gear5/orbit-hero.tsx.
        </p>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 text-xl">03 / Make your first impression.</h2>
        <Copyable
          value={EXAMPLES["orbit-hero"]}
          label="Copy Orbit Hero usage"
          block
        />
        <p className="mt-3 text-sm leading-7 text-smoke">
          Change the accent, headline, and actions. Use real section ids and
          your own contact address. On each component page, the source includes
          the complete TypeScript prop interface.
        </p>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 text-xl">04 / Take the whole canvas.</h2>
        <Copyable
          value={installCommand("portfolio-template")}
          label="Copy portfolio template install command"
        />
        <p className="mt-3 text-sm leading-7 text-smoke">
          Folio 01 installs all five blocks together. Replace the fictional
          name, example projects, testimonials, email, and service prices before
          publishing.
        </p>
        <Link href="/templates/portfolio" className="button-secondary mt-5">
          Explore Folio 01 ↗
        </Link>
      </section>
      <section className="mt-12 border-t border-hairline pt-7">
        <h2 className="text-xl">A few thoughtful defaults.</h2>
        <p className="mt-4 text-sm leading-7 text-smoke">
          Blocks use explicit dark surfaces and CSS variables for their accent.
          They need no custom keyframes, hosted font, icon package, or animation
          runtime. Keyboard interactions and reduced-motion fallbacks are
          included. Supply your own translated text and check contrast after
          changing colors.
        </p>
      </section>
    </main>
  );
}
