# Learnings

A dated record of what the project learns from user feedback, source research,
browser observations, and measured output. Keep guesses visibly separate from
facts. Add links beside claims about external tools or standards.

## 2026-10-02 — Build for the page, then design the interaction

- **User feedback:** the site did not feel useful enough. A small collection
  deserves stronger page-level previews and a product that solves work people
  actually need to show. Count alone is not a quality signal.
- **Decision:** keep portfolios and launch pages as the focus. Add Project
  Gallery for image-led portfolios and Spotlight Bento for product/process
  stories. Both augment an existing job instead of changing basic controls for
  their own sake. The signed-off purposes and acceptance bars are in
  `components.md`.
- **Cadence from user:** look for one meaningful improvement every 20 minutes;
  release at most two new components per India-calendar day. The two entries
  above use today's allocation; later runs can work on quality or documentation.
- **Visual policy:** the Vengeance UI catalog demonstrates why buyers value a
  live interaction preview before installation. Treat it as product research;
  write Gear5's own visual systems, interactions, words, and artwork.
  [Vengeance UI catalog](https://www.vengenceui.com/components)
- **Source ownership:** shadcn distributes editable source, so consumers should
  be able to replace an artwork slot or copy without learning a new API.
  Describe each item and every registry dependency explicitly.
  [shadcn registry guide](https://ui.shadcn.com/docs/registry/getting-started)
- **Motion:** a cursor effect has to preserve all content without a pointer and
  yield to the system's reduced-motion setting. Keep optional light separate
  from meaningful information.
  [Motion accessibility](https://motion.dev/docs/react-accessibility)
- **Measured scope:** with pnpm's budget test settings (minified ESM,
  ES2020, JSX automatic, React external, gzip), Project Gallery is 2,309 B,
  Spotlight Bento is 2,143 B, and Folio 01 is 7,394 B. Each fits its declared
  registry budget. Gallery takes consumer-owned React artwork; do not add
  remote image URLs or automatic preloads.
- **Regression findings:** a missing `matchMedia` result used to throw while
  mounting Bento inside Folio; Bento now leaves content static when the API is
  unavailable. The existing Folio navigation check also caught an invalid
  Process fragment and now resolves its target.
- **Verification limits:** axe fixtures pass, but are not manual screen-reader
  certification. A desktop development preview rendered all seven blocks; no
  device-lab or manual assistive-technology session was run.

## Ongoing notes

- Record when an observation was gathered, which browser/viewport or repo state
  was used, and whether it was measured or inferred.
- Remove a stale note when later evidence supersedes it; retain the reason in
  `CHANGELOG.md` if the correction affects users.
