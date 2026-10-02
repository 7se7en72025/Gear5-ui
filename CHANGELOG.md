# Changelog

All notable changes to Gear5 UI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Collection 01 rebuild (2026-10-02)

- Replaced the previous root catalog with five original expressive blocks:
  Orbit Hero, Project Showcase, Feature Switcher, Pricing Switch, and
  Testimonial Deck. Added Folio 01, a complete configurable portfolio template.
- Rebuilt the homepage, component playgrounds, template gallery, installation
  guide, branding, social images, and machine-readable catalog around portfolios
  and product launches. Customized usage copies the chosen headline and accent.
- Removed retired component sources, unused demos, old catalog tests, and
  obsolete screenshots/videos. The independent historical `gear5/` app remains
  outside this collection.
- Added `registry:block` installation targets and a template bundle budget that
  includes every block dependency. Preserved safe registry publication.
- Fixed mobile install-code overflow, Next 16 smooth route scrolling, and
  executable URL schemes disguised with tabs or newlines.

### Collection 01 verification

- `pnpm verify` passed: types, lint (zero errors or warnings), 14 registry
  regressions, and 81 Vitest tests across eight files. Vite emits its existing
  CJS Node API deprecation notice.
- `pnpm build` passed: 22 static outputs and eight registry JSON files.
- All six block/template fixtures passed axe and server rendering. The actual
  distributed template bundled in a fresh consumer file tree.
- Individual blocks measured 1,226–1,660 B gzip; the full template, including
  its dependencies, measured 6,005 B with React external (10,000 B ceiling).
- Browser checks covered desktop, 390 px and 320 px viewports, keyboard tabs,
  native disclosures, monthly/yearly totals, quote wraparound, customization,
  copied code, and template section links. No horizontal page overflow remained.

### Earlier registry hardening

### Added

- Evidence-first improvement guidance, an architecture map, and current handoff
  record, adapted from [amzn_code](https://github.com/medhu123/amzn_code).
- Registry regression tests included in `pnpm verify` and CI. CI now uses a
  read-only repository token and a 20-minute job timeout.

### Fixed

- Registry generation validates the manifest and reads all source files before
  publishing, so invalid inputs preserve the last successful output. Each JSON
  is replaced via temporary file and rename; the index is published last and
  retired items removed afterward. Both quote styles in local imports are
  rewritten, and ambiguous names or missing dependencies fail explicitly.

### Previous catalog verification (2026-10-02)

- 13 registry regressions passed; the real registry produced 222 JSON files.
- `pnpm verify` passed: type checking, lint (0 errors, 27 existing warnings),
  13 registry tests, and 1,485 component tests across 11 Vitest files.
- `pnpm build` passed and generated 430 static pages.
- All 222 real registry files were byte-identical to the previous committed
  generator under the same deployment URL. With a source removed, the old
  generator lost its index; the new generator preserved all previous files.

## [0.1.0] - 2026-01-01

### Added

- 87 UI components across 8 categories
- 11 shared primitives (hooks and utilities)
- 10-axis verification system (performance, accessibility, internationalisation, privacy, security, resilience, offline, SSR safety, sensory safety, supply chain)
- 866 tests covering all axes
- Copy-paste distribution via shadcn CLI
- Live documentation site with component browser and playground
- Support for 10+ locales including RTL languages
- Support for non-Gregorian calendars (Islamic, Buddhist, Persian)
- Address field forms for 43 countries
- Name field order for family-name-first languages
- Network simulation (Fast, Slow, Offline)
- Draft storage with security exclusions (passwords, payment fields, OTPs)
- AdaptiveImage with Save-Data awareness
- AsyncBoundary with four states (loading, error, empty, offline)
- ResilientForm with offline queueing and double-submit prevention
- ErrorBoundary with announced, focusable, recoverable fallback
- ThemeToggle with system preference detection
- CommandPalette with keyboard navigation
- Zero runtime dependencies enforced by CI
- SSR verification through react-dom/server
- Accessibility testing via axe
- Static analysis for forbidden APIs (fetch, eval, innerHTML)
- prefers-reduced-motion enforcement for animations
