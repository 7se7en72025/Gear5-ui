import * as React from "react";
import type { ArtifactVersion } from "../types";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { useControllableState } from "../utils/use-controllable-state";
import { visuallyHidden } from "../utils/visually-hidden";

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface ArtifactContextValue {
  title: string;
  versions: readonly ArtifactVersion[];
  activeVersion: ArtifactVersion | undefined;
  activeIndex: number;
  setActiveVersionId: (id: string) => void;
  streaming: boolean;
  titleId: string;
  contentId: string;
}

const [ArtifactProvider, useArtifactContext] =
  createContext<ArtifactContextValue>("Artifact");

/** Read the artifact's versions and which one is showing. */
export function useArtifact(): ArtifactContextValue {
  return useArtifactContext("useArtifact");
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ArtifactProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange" | "title"> {
  title: string;
  /** Every revision, oldest first. */
  versions: readonly ArtifactVersion[];
  activeVersionId?: string;
  defaultActiveVersionId?: string;
  onActiveVersionChange?: (id: string) => void;
  /** True while the newest version is still being written. */
  streaming?: boolean;
  asChild?: boolean;
}

/**
 * A document the agent produced, with its revision history.
 *
 * Agents rewrite their output repeatedly, and losing the earlier draft is a
 * real failure mode — so versions are first class rather than an afterthought.
 *
 * ```tsx
 * <Artifact title="report.md" versions={versions} streaming={isWriting}>
 *   <ArtifactHeader>
 *     <ArtifactTitle />
 *     <ArtifactVersionSelect />
 *   </ArtifactHeader>
 *   <ArtifactContent />
 * </Artifact>
 * ```
 */
export const Artifact = React.forwardRef<HTMLElement, ArtifactProps>(
  function Artifact(
    {
      title,
      versions,
      activeVersionId,
      defaultActiveVersionId,
      onActiveVersionChange,
      streaming = false,
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const titleId = `handoff-artifact-${reactId}-title`;
    const contentId = `handoff-artifact-${reactId}-content`;

    const latestId = versions.at(-1)?.id;

    const [selectedId, setSelectedId] = useControllableState({
      prop: activeVersionId,
      defaultProp: defaultActiveVersionId ?? latestId,
      onChange: onActiveVersionChange,
    });

    // While streaming, the newest version is the one being written, so follow
    // it — unless the reader deliberately went back to an older draft.
    const resolvedId = React.useMemo(() => {
      if (selectedId && versions.some((v) => v.id === selectedId)) {
        return selectedId;
      }
      return latestId;
    }, [selectedId, versions, latestId]);

    const activeIndex = versions.findIndex((v) => v.id === resolvedId);
    const activeVersion = activeIndex >= 0 ? versions[activeIndex] : undefined;

    const Comp = resolveElement(asChild, "section");

    return (
      <ArtifactProvider
        value={{
          title,
          versions,
          activeVersion,
          activeIndex,
          setActiveVersionId: setSelectedId,
          streaming,
          titleId,
          contentId,
        }}
      >
        <Comp
          ref={forwardedRef}
          aria-labelledby={titleId}
          data-handoff-part="artifact"
          data-streaming={streaming ? "" : undefined}
          {...rest}
        >
          {children}
        </Comp>
      </ArtifactProvider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Header
 * ---------------------------------------------------------------------- */

export interface ArtifactHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const ArtifactHeader = React.forwardRef<
  HTMLDivElement,
  ArtifactHeaderProps
>(function ArtifactHeader({ asChild = false, ...rest }, forwardedRef) {
  const Comp = resolveElement(asChild, "div");
  return <Comp ref={forwardedRef} data-handoff-slot="artifact-header" {...rest} />;
});

export interface ArtifactTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

/** The artifact name. Labels the whole section. */
export const ArtifactTitle = React.forwardRef<
  HTMLHeadingElement,
  ArtifactTitleProps
>(function ArtifactTitle({ asChild = false, children, ...rest }, forwardedRef) {
  const { title, titleId } = useArtifactContext("ArtifactTitle");
  const Comp = resolveElement(asChild, "h3");
  return (
    <Comp ref={forwardedRef} id={titleId} {...rest}>
      {children ?? title}
    </Comp>
  );
});

/* -------------------------------------------------------------------------
 * Version switching
 * ---------------------------------------------------------------------- */

export interface ArtifactVersionSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  label?: string;
}

/**
 * Version picker.
 *
 * A real `<select>`, not a custom menu: it is keyboard accessible, works on
 * touch, and needs no popup layer — none of which a div-based dropdown gets
 * for free.
 */
export const ArtifactVersionSelect = React.forwardRef<
  HTMLSelectElement,
  ArtifactVersionSelectProps
>(function ArtifactVersionSelect({ label = "Version", ...rest }, forwardedRef) {
  const { versions, activeVersion, setActiveVersionId } =
    useArtifactContext("ArtifactVersionSelect");

  // Nothing to switch between until there is a second draft.
  if (versions.length < 2) return null;

  return (
    <select
      ref={forwardedRef}
      aria-label={label}
      value={activeVersion?.id ?? ""}
      onChange={(event) => setActiveVersionId(event.target.value)}
      data-handoff-slot="artifact-versions"
      {...rest}
    >
      {versions.map((version, index) => (
        <option key={version.id} value={version.id}>
          {version.label || `Version ${index + 1}`}
        </option>
      ))}
    </select>
  );
});

export interface ArtifactVersionCountProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** "3 of 5" position indicator. */
export const ArtifactVersionCount = React.forwardRef<
  HTMLSpanElement,
  ArtifactVersionCountProps
>(function ArtifactVersionCount({ asChild = false, children, ...rest }, forwardedRef) {
  const { versions, activeIndex } = useArtifactContext("ArtifactVersionCount");
  if (versions.length < 2) return null;

  const Comp = resolveElement(asChild, "span");
  return (
    <Comp ref={forwardedRef} {...rest}>
      {children ?? `${activeIndex + 1} of ${versions.length}`}
    </Comp>
  );
});

/* -------------------------------------------------------------------------
 * Content
 * ---------------------------------------------------------------------- */

export interface ArtifactContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** The active version's body. */
export const ArtifactContent = React.forwardRef<
  HTMLDivElement,
  ArtifactContentProps
>(function ArtifactContent({ asChild = false, children, ...rest }, forwardedRef) {
  const { activeVersion, contentId, streaming } =
    useArtifactContext("ArtifactContent");

  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={forwardedRef}
      id={contentId}
      // No role here: the labelled <section> root is already the region, and
      // nesting a second one with the same name makes screen readers announce
      // the artifact twice on entry.
      aria-busy={streaming || undefined}
      data-handoff-slot="artifact-content"
      {...rest}
    >
      {children ?? activeVersion?.content ?? null}
    </Comp>
  );
});

export interface ArtifactStaleNoticeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * Shown when the reader is looking at an older draft.
 *
 * Without it, someone who scrolled back a version has no signal that the agent
 * has since moved on, and will act on stale content.
 */
export const ArtifactStaleNotice = React.forwardRef<
  HTMLDivElement,
  ArtifactStaleNoticeProps
>(function ArtifactStaleNotice({ asChild = false, children, ...rest }, forwardedRef) {
  const { versions, activeIndex } = useArtifactContext("ArtifactStaleNotice");
  const isLatest = activeIndex === versions.length - 1;
  if (isLatest || activeIndex < 0) return null;

  const Comp = resolveElement(asChild, "div");
  return (
    <Comp ref={forwardedRef} role="status" data-handoff-slot="stale" {...rest}>
      {children ?? "You are viewing an earlier version."}
      <span style={visuallyHidden}>
        {` Version ${activeIndex + 1} of ${versions.length}.`}
      </span>
    </Comp>
  );
});
