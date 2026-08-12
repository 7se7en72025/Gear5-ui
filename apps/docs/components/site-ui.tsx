import * as React from "react";

/**
 * Small monospace label that sits above a heading.
 *
 * Gives long pages a repeating anchor so sections are scannable without
 * resorting to bigger and bigger headings.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
      <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
      {children}
    </p>
  );
}

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className="text-[1.6rem] leading-tight">
          {title}
        </h2>
        {lede ? (
          <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{lede}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/**
 * Concrete numbers about the project.
 *
 * Vague claims are cheap. A bundle size and a test count are checkable, which
 * is the only reason to put them on a page like this.
 */
export function Stats({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-bg px-5 py-4">
          <dt className="text-[12px] text-fg-faint">{item.label}</dt>
          <dd className="mt-1 font-mono text-[19px] tracking-tight">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
