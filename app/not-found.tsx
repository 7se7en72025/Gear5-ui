import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="gear-grid flex min-h-[65vh] flex-col items-center justify-center px-5 py-20 text-center"
    >
      <p className="font-mono text-sm text-coral">404 / Page not found</p>
      <h1 className="section-heading mt-5">This piece is missing.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-smoke">
        That page may have moved, or the link may be incomplete. The rest of the
        library is right here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/components" className="button-primary">
          Browse components ↗
        </Link>
        <Link href="/" className="button-secondary">
          Back home
        </Link>
      </div>
    </main>
  );
}
