# Gear5 UI

**Make the web feel something.**

Original, expressive React blocks for portfolios and product launches. Seven
interactive components, one complete portfolio template, and editable source
installed through the shadcn CLI. Built with React and Tailwind CSS 4.

[Live site](https://gear5-ui.vercel.app) · [Components](https://gear5-ui.vercel.app/components) · [Folio 01](https://gear5-ui.vercel.app/templates/portfolio)

## Collection 01

| Block            | What it does                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| Orbit Hero       | Bold headline, clear actions, and pointer-responsive orbital artwork    |
| Project Showcase | Tactile project cards with native expandable case studies               |
| Project Gallery  | Filter real work and move through a selected case study                 |
| Feature Switcher | Keyboard-controlled tabs and a visual stage for your process or product |
| Spotlight Bento  | An editorial feature grid with an optional mouse spotlight              |
| Pricing Switch   | Monthly/yearly billing controls with explicit prices and billing notes  |
| Testimonial Deck | Manual quote navigation, wraparound controls, and live announcements    |

**Folio 01** combines five complementary blocks into a complete independent
designer/developer portfolio: introduction, visual project gallery, process,
services, testimonials, and contact. Default names, projects, prices, and
quotes are fictional examples.

## New blocks

`components.md` is the living product decision record. The first two reviewed
additions are the keyboard-ready Project Gallery and the reduced-motion-aware
Spotlight Bento. Their original artwork, acceptance criteria, and research are
there. `learnings.md` keeps dated feedback and verified findings.

## Install

Start with a React app, Tailwind CSS 4, and configured shadcn aliases:

```bash
npx shadcn@latest init
npx shadcn@latest add https://gear5-ui.vercel.app/r/orbit-hero.json
# Or install the complete template and all its blocks:
npx shadcn@latest add https://gear5-ui.vercel.app/r/portfolio-template.json
```

```tsx
import { OrbitHero } from "@/components/gear5/orbit-hero";

export default function Hero() {
  return (
    <OrbitHero
      headingLevel="h1"
      title={"Ideas into\nsomething real."}
      accent="#d9fc87"
      action={{ label: "See my work", href: "#work" }}
      secondaryAction={{
        label: "Get in touch",
        href: "mailto:you@example.com",
      }}
    />
  );
}
```

The CLI copies source into your project. No extra component runtime or motion
package is required. Component pages include live accent/headline controls,
customized usage snippets, installer-ready source, and helper files for manual
installation. Use your own content and check contrast after changing accents.

## Development

Use Node from `.nvmrc` and pnpm from `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify         # types, lint, registry regressions, and component tests
pnpm build          # production site + generated registry
pnpm test:registry  # safe registry writes and reproducible generation
```

Registry URLs use `NEXT_PUBLIC_SITE_URL`, then Vercel’s production/preview URL,
then `localhost:3000`. Generated `public/r/` is ignored and rebuilt from the
manifest and source. Runtime imports in distributed files are rewritten to the
consumer aliases. `next.config.ts` generates the registry even when a hosting
platform invokes Next directly.

## Verification

The suite checks every block and the template with axe and server rendering.
Behaviour tests exercise keyboard tabs, direction, billing updates, quote
navigation, custom content, links, and live customization. Every item is bundled,
minified, and gzipped with React external against its tier ceiling; the template
budget includes all its block dependencies. Source scans cover privacy, unsafe
HTML, and reduced-motion guards. A fresh consumer-tree test bundles the actual
generated template and its installed dependencies.

These automated checks are a baseline. Test your own content, mobile browsers,
keyboard flows, and screen readers before shipping.

## Working guide

[AGENTS.md](AGENTS.md) · [Architecture](ARCHITECTURE.md) ·
[Improvement loop](IMPROVEMENT.md) · [Handoff](HANDOFF.md) ·
[Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

The previous general-purpose catalog has been retired from the root application.
The independent historical `gear5/` application is outside this collection.

## License

MIT. This is original Gear5 work; Vengeance UI informed the product direction,
not the component source or artwork.
