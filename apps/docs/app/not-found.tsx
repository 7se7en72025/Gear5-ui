import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-accent">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-fg sm:text-4xl">
        Off the map
      </h1>
      <p className="mt-4 max-w-[420px] text-fg-muted">
        That page does not exist. It may have been renamed, or the component you
        are after has not shipped yet.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/components"
          className="rounded-chip bg-accent px-5 py-2.5 text-[14px] font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Browse components
        </Link>
        <Link
          href="/"
          className="rounded-chip border border-line px-5 py-2.5 text-[14px] font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
