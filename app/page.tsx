import Link from "next/link";
import { OrbitHero } from "@/registry/gear5/ui/orbit-hero";
import { ProjectShowcase } from "@/registry/gear5/ui/project-showcase";
import { ProjectGallery } from "@/registry/gear5/ui/project-gallery";
import { SpotlightBento } from "@/registry/gear5/ui/spotlight-bento";
import { FeatureSwitcher } from "@/registry/gear5/ui/feature-switcher";
import { Copyable } from "@/components/site/copyable";
import { installCommand } from "@/lib/registry";
export default function Home() {
  return (
    <main id="main">
      <div className="mx-auto max-w-[1320px] px-5 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-7 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[.12em] text-smoke">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-coral"
            />{" "}
            COLLECTION 01 — NOW LIVE
          </span>
          <span className="hidden sm:block">REACT / TAILWIND / YOURS</span>
        </div>
        <OrbitHero
          headingLevel="h1"
          eyebrow="For the sites that deserve a little more."
          title={"Make the web\nfeel something."}
          description="Expressive React blocks for portfolios and product launches. Beautiful interactions. Source you own. Ready for your next big thing."
          action={{ label: "Explore components", href: "/components" }}
          secondaryAction={{
            label: "See the template",
            href: "/templates/portfolio",
          }}
          className="!p-0 !bg-transparent lg:!py-10"
        />
        <p className="mt-5 text-sm text-smoke">
          Not sure where to start?{" "}
          <Link href="/use-cases" className="text-coral underline underline-offset-4">
            Find blocks by page job <span aria-hidden="true">↗</span>
          </Link>
        </p>
        <div className="mt-10 grid min-w-0 gap-5 border-y border-hairline py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0 max-w-lg">
            <Copyable
              value={installCommand("orbit-hero")}
              label="Copy Orbit Hero install command"
            />
          </div>
          <p className="flex flex-wrap gap-5 font-mono text-[10px] text-smoke">
            <span>01 / COPY & OWN</span>
            <span>02 / MIT LICENSED</span>
            <span>03 / NO MOTION DEPENDENCY</span>
          </p>
        </div>
      </div>
      <section className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Small collection. Big character.</p>
            <h2 className="section-heading mt-4">
              Your next site starts here.
            </h2>
          </div>
          <Link href="/components" className="button-secondary">
            Explore all 7 blocks <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="min-w-0 overflow-hidden rounded-3xl border border-hairline">
            <ProjectShowcase
              projects={[
                {
                  id: "forma",
                  title: "Forma",
                  category: "Click to open the project",
                  description:
                    "Tell the story behind your work. This card opens with touch, click, or keyboard.",
                  href: "/components/project-showcase",
                  symbol: "f.",
                  color: "#d5e6d3",
                },
              ]}
              title="Give your work the spotlight."
              className="[&>div]:md:!grid-cols-1"
            />
            <div className="flex justify-between border-t border-hairline px-6 py-5 text-sm">
              <span>01 / Project Showcase</span>
              <Link href="/components/project-showcase" className="text-coral">
                Get component ↗
              </Link>
            </div>
          </article>
          <article className="min-w-0 overflow-hidden rounded-3xl border border-hairline">
            <FeatureSwitcher title="A process worth showing." />
            <div className="flex justify-between border-t border-hairline px-6 py-5 text-sm">
              <span>02 / Feature Switcher</span>
              <Link href="/components/feature-switcher" className="text-coral">
                Get component ↗
              </Link>
            </div>
          </article>
        </div>
      </section>
      <section className="border-y border-hairline bg-anvil/40">
        <div className="mx-auto max-w-[1320px] space-y-5 px-5 py-10 sm:px-8 sm:py-16">
          <ProjectGallery
            eyebrow="NEW / PROJECT GALLERY"
            title="More room for the work."
          />
          <SpotlightBento
            eyebrow="NEW / SPOTLIGHT BENTO"
            title="Tell the whole story, at a glance."
          />
        </div>
      </section>
      <section className="border-y border-hairline bg-anvil/60">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.7fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">The whole picture</p>
            <h2 className="section-heading mt-4">
              Five blocks.
              <br />
              One good first impression.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-smoke">
              Meet Folio 01. A complete designer portfolio built from the
              collection. Swap in your work, tune the accent, and make it yours.
            </p>
            <Link href="/templates/portfolio" className="button-primary mt-7">
              Explore Folio 01 <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <Link
            href="/templates/portfolio"
            aria-label="Preview Folio 01 portfolio template"
            className="group block rounded-2xl border border-hairline bg-[#0c0e10] p-5 shadow-[0_30px_80px_#0004] transition-transform duration-300 motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
          >
            <div className="mb-5 flex justify-between border-b border-hairline pb-4 text-xs">
              <span className="font-serif text-lg font-bold">am.</span>
              <span className="text-smoke">Work · Process · Let’s talk ↗</span>
            </div>
            <div className="grid grid-cols-[1fr_.65fr] items-center gap-4">
              <div>
                <p className="font-mono text-[8px] text-coral">
                  INDEPENDENT DESIGNER
                </p>
                <p className="mt-4 text-[clamp(1.7rem,3vw,3rem)] leading-[1.05] tracking-[-.06em]">
                  Thoughtful design.
                  <br />
                  <span className="text-smoke">Unexpected details.</span>
                </p>
                <span className="mt-5 inline-block rounded-full bg-coral px-3 py-2 text-[9px] text-on-accent">
                  Selected work ↗
                </span>
              </div>
              <div
                aria-hidden="true"
                className="flex aspect-square items-center justify-center rounded-2xl border border-hairline bg-[#1c2024] font-mono text-5xl font-bold text-coral motion-safe:-rotate-12"
              >
                am.
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2" aria-hidden="true">
              {[
                ["f.", "#d5e6d3"],
                ["m↗", "#c9c4e4"],
                ["t*", "#ead3b9"],
              ].map(([symbol, color]) => (
                <div
                  key={symbol}
                  style={{ background: color }}
                  className="flex aspect-[4/3] items-center justify-center rounded-lg font-serif text-4xl text-[#17191b]"
                >
                  {symbol}
                </div>
              ))}
            </div>
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:grid-cols-3 sm:px-8">
        {[
          [
            "Make it yours.",
            "Edit the source, change the accent, bring your own content. No black box.",
          ],
          [
            "Motion with manners.",
            "Touch-friendly, keyboard-ready, with reduced-motion fallbacks.",
          ],
          [
            "Small by design.",
            "React and Tailwind. Each block has an enforced bundle budget.",
          ],
        ].map(([title, text], i) => (
          <div key={title}>
            <span className="font-mono text-xs text-coral">0{i + 1} /</span>
            <h2 className="mt-4 text-lg font-medium">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-smoke">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
