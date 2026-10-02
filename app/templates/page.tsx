import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Templates",
  description:
    "Folio 01: a complete original portfolio made from five expressive Gear5 blocks.",
  alternates: { canonical: "/templates" },
};
export default function TemplatesPage() {
  return (
    <main id="main" className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8">
      <p className="eyebrow">A head start, with character.</p>
      <h1 className="mt-5 text-5xl font-medium tracking-[-.065em] sm:text-7xl">
        The whole canvas<span className="text-coral">.</span>
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-smoke">
        A complete page, built from blocks you can take apart and make your own.
      </p>
      <Link
        href="/templates/portfolio"
        className="group mt-12 grid overflow-hidden rounded-3xl border border-hairline lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="bg-[#171b1e] p-8 sm:p-12">
          <div className="rounded-2xl border border-white/15 bg-[#0b0c0e] p-6 shadow-2xl transition-transform duration-500 motion-safe:group-hover:-translate-y-2 motion-reduce:transition-none">
            <div className="flex justify-between border-b border-hairline pb-4">
              <span className="font-serif text-xl font-bold">am.</span>
              <span className="text-[10px] text-smoke">
                Work · Process · Contact
              </span>
            </div>
            <p className="mt-8 font-mono text-[9px] text-coral">
              AVAILABLE FOR SELECT PROJECTS
            </p>
            <p className="mt-4 text-4xl leading-[1.05] tracking-[-.06em] sm:text-5xl">
              Thoughtful design.
              <br />
              <span className="text-smoke">Unexpected details.</span>
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3" aria-hidden="true">
              {[
                ["f.", "#d5e6d3"],
                ["m↗", "#c9c4e4"],
                ["t*", "#ead3b9"],
              ].map(([text, color]) => (
                <div
                  key={text}
                  style={{ background: color }}
                  className="flex aspect-square items-center justify-center rounded-xl font-serif text-5xl text-[#17191b]"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <p className="eyebrow">Template 01 / Portfolio</p>
          <h2 className="mt-4 text-4xl tracking-[-.05em]">Folio 01</h2>
          <p className="mt-5 text-sm leading-7 text-smoke">
            For independent designers and developers. Selected work, your
            process, service plans, kind words, and a clear next step.
          </p>
          <p className="mt-8 font-mono text-[10px] text-smoke">
            5 COMPONENTS · RESPONSIVE · EDITABLE SOURCE
          </p>
          <span className="mt-7 text-sm text-coral">
            Preview & install <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
    </main>
  );
}
