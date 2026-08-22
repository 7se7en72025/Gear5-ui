import * as React from "react";
import type { EnvironmentKind, EnvironmentRef } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

interface EnvironmentBadgeContextValue {
  environment: EnvironmentRef;
  /** True when a mistake here reaches real users. */
  live: boolean;
}

const [EnvironmentBadgeProvider, useEnvironmentBadgeContext] =
  createContext<EnvironmentBadgeContextValue>("EnvironmentBadge");

/** Read the environment this badge describes. */
export function useEnvironmentBadge(): EnvironmentBadgeContextValue {
  return useEnvironmentBadgeContext("useEnvironmentBadge");
}

const KIND_LABEL: Record<EnvironmentKind, string> = {
  production: "Production",
  staging: "Staging",
  development: "Development",
  sandbox: "Sandbox",
};

export interface EnvironmentBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  environment: EnvironmentRef;
  labels?: Partial<Record<EnvironmentKind, string>>;
  asChild?: boolean;
}

/**
 * Where the agent's actions actually land.
 *
 * The worst agent failures are not wrong answers, they are right answers
 * applied to the wrong target. Someone approves a migration believing they are
 * on staging. Nothing else in an agent interface answers that question, so this
 * states it in the same place every time and never lets production be quiet.
 *
 * ```tsx
 * <EnvironmentBadge environment={{ kind: "production", name: "api-prod-eu" }}>
 *   <EnvironmentName />
 *   <EnvironmentWarning />
 * </EnvironmentBadge>
 * ```
 */
export const EnvironmentBadge = React.forwardRef<
  HTMLDivElement,
  EnvironmentBadgeProps
>(function EnvironmentBadge(
  { environment, labels, asChild = false, children, ...rest },
  forwardedRef,
) {
  const live = environment.kind === "production";
  const label = labels?.[environment.kind] ?? KIND_LABEL[environment.kind];
  const Comp = resolveElement(asChild, "div");

  return (
    <EnvironmentBadgeProvider value={{ environment, live }}>
      <Comp
        ref={forwardedRef}
        data-handoff-part="environment-badge"
        data-kind={environment.kind}
        data-live={live ? "" : undefined}
        data-destructive={environment.destructive ? "" : undefined}
        {...rest}
      >
        {children}
        {/* One sentence rather than a colour and an abbreviation. Read on
            entry, so the target is known before anything is approved. */}
        <span style={visuallyHidden}>
          {`Target: ${label}${environment.name ? `, ${environment.name}` : ""}.`}
          {live ? " Changes here affect real users." : ""}
          {environment.destructive ? " Actions here cannot be undone." : ""}
        </span>
      </Comp>
    </EnvironmentBadgeProvider>
  );
});

export interface EnvironmentNameProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  labels?: Partial<Record<EnvironmentKind, string>>;
  asChild?: boolean;
}

/** The environment name, falling back to the kind. */
export const EnvironmentName = React.forwardRef<
  HTMLSpanElement,
  EnvironmentNameProps
>(function EnvironmentName({ labels, asChild = false, children, ...rest }, forwardedRef) {
  const { environment } = useEnvironmentBadgeContext("EnvironmentName");
  const Comp = resolveElement(asChild, "span");

  return (
    <Comp ref={forwardedRef} aria-hidden="true" {...rest}>
      {children ??
        environment.name ??
        labels?.[environment.kind] ??
        KIND_LABEL[environment.kind]}
    </Comp>
  );
});

export interface EnvironmentWarningProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/**
 * Shown only on production.
 *
 * Everywhere else this renders nothing, so the warning keeps its meaning
 * instead of becoming decoration people stop seeing.
 */
export const EnvironmentWarning = React.forwardRef<
  HTMLSpanElement,
  EnvironmentWarningProps
>(function EnvironmentWarning({ asChild = false, children, ...rest }, forwardedRef) {
  const { live } = useEnvironmentBadgeContext("EnvironmentWarning");
  if (!live) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} aria-hidden="true" data-handoff-slot="warning" {...rest}>
      {children ?? "Live"}
    </Comp>
  );
});
