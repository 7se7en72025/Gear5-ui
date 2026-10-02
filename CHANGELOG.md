# Changelog

All notable changes to Anywhere UI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Verification (2026-10-02)

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
