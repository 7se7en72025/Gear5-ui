import type * as React from "react";
import { cn } from "./lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * The screen before there is anything to show — no runs yet, no results, a
 * search with nothing matching it. Left blank, this is where a product reads
 * as broken rather than as new.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-panel border border-dashed border-line px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-panel-raised text-fg-faint">
          {icon}
        </div>
      ) : null}
      <p className="text-[15px]">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-fg-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
