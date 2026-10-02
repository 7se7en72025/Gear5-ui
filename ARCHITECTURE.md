# Gear5 UI architecture

The root app is a curated animated-block library for portfolios and product
launches. Collection 01 contains seven blocks, one portfolio template, and a
safe-link helper. The old general-purpose root catalog and unused demos have
been removed. The historical `gear5/` project builds separately.

| Stage         | Source                                          | Responsibility                                                                                                     |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Block code    | `registry/gear5/ui/`                            | Orbit Hero, Project Showcase, Project Gallery, Feature Switcher, Spotlight Bento, Pricing Switch, Testimonial Deck |
| Composition   | `portfolio-template.tsx`                        | Folio 01, using five complementary blocks and caller content                                                       |
| Helper        | `registry/gear5/lib/sanitize.ts`                | Neutralize executable link schemes                                                                                 |
| Manifest      | `registry.json`                                 | Seven registry:ui items, one registry:block template, one registry:lib helper                                      |
| Distribution  | `scripts/build-registry.mjs`                    | Rewrite imports and publish installer-ready JSON                                                                   |
| Fixtures      | `components/demos.tsx`                          | One small fixture for each of seven blocks and the template; shared accessibility and server-render checks         |
| Playground    | `components/site/preview.tsx`                   | Accent/headline controls, reset, customized copyable usage                                                         |
| Documentation | `app/components/[name]/`, `lib/doc-examples.ts` | Live preview, install, usage, notes, source, helper files                                                          |
| Templates     | `app/templates/`                                | Template catalog, complete live portfolio, all source and installation                                             |
| Decisions     | `components.md`, `learnings.md`                 | Intake, acceptance criteria, verified findings, and dated choices                                                  |
| Verification  | `tests/`                                        | Registry reliability, budgets, source scans, keyboard/state behaviour, axe, SSR, fresh consumer bundle             |

## Design and interaction

The site uses graphite surfaces, lime accents, system typography, and code-native
artwork. Blocks include their own dark surfaces and `--g5-accent` variable;
consumers need React and Tailwind CSS 4, not the site stylesheet or an animation
package. Tailwind motion-safe/motion-reduce variants guard transforms and
transitions. There is no autoplay or external asset request.

Server pages use promised route params from the installed Next.js guides.
Interactive blocks, clipboard controls, and customization are client components.
The source reader is server-only and reads generated JSON, so manual source
copies use exactly the same consumer aliases as the installer.

## Registry safety

The build validates names, supported types, source paths, unique basenames, and
dependency existence. It reads all source before replacing any output. Each
JSON uses a unique temporary sibling and rename, index last, then retired JSON
cleanup. Invalid inputs preserve old output. Atomicity is per file, not across
the whole directory; rerun after interruption and avoid concurrent builds with
different inputs into one folder.

`next.config.ts` generates the registry for both Next dev and build. URL
precedence matches `lib/site.ts`: explicit public URL, Vercel production URL,
Vercel preview URL, localhost.

## Reproduction

`pnpm install --frozen-lockfile`, `pnpm verify`, `pnpm build`.
CI runs the same checks with read-only repository permissions. Budget tiers
are mirrored and asserted in `lib/registry.ts` and `tests/budget.test.ts`;
`page` is 10,000 B gzipped including all template dependencies.
Generated output, local secrets, and dependencies stay out of Git.
