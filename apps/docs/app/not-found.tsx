import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-cyan-400">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
        Off the map
      </h1>
      <p className="mt-4 max-w-[420px] text-neutral-400">
        That page does not exist. It may have been renamed, or the component you
        are after has not shipped yet.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/components"
          className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-cyan-400"
        >
          Browse components
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-neutral-300 transition-all hover:border-white/20 hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
