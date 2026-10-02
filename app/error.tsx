"use client";

import Link from "next/link";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main
      id="main"
      className="flex min-h-[65vh] flex-col items-center justify-center px-5 py-20 text-center"
    >
      <p className="eyebrow">Something interrupted this page</p>
      <h1 className="section-heading mt-5">Let&apos;s try that again.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-smoke">
        We couldn&apos;t load this part of the site. You can retry, or head back
        to the library.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={retry} className="button-primary">
          Try again
        </button>
        <Link href="/components" className="button-secondary">
          Browse components
        </Link>
      </div>
    </main>
  );
}
