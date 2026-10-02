# Current handoff

Updated 2026-10-02 (Asia/Calcutta).

## User's direction

The user disliked the site's direction and wants Gear5 to become a useful,
living library of polished, original blocks inspired by the category and live
preview approach of Vengeance UI. Research and code belong in the repo so the
user can stay hands-off.

At most two new blocks may be released per calendar day in India. The user
wants a useful repo improvement every 20 minutes. No recurring-run automation
tool is connected in this workspace, so this is a requested cadence, not an
active scheduled job. After the daily block limit, improve previews, docs,
polish, performance, or fixes; do not manufacture components for a count. The
first two blocks today are Project Gallery and Spotlight Bento.

## Current repo state

`origin/main` includes `cb8fcbd`, following the five-block baseline `b7f723a`.
Commit `a457504` added the two researched blocks: image-led project browsing in
Project Gallery and an editorial four-tile story layout in Spotlight Bento.
Folio 01 uses both for its work and process sections and remains five
complementary blocks, with caller-owned project artwork and contact details.
`components.md` and `learnings.md` are the design intake and evidence record.

`pnpm verify` measured Project Gallery at 2,309 B, Spotlight Bento at 2,143 B,
and Folio 01 at 7,394 B gzip, with React external. All are inside their declared
registry tiers.

## Current checks

`pnpm verify` passes: typecheck, full lint, 14 registry build regressions, and
94 Vitest cases across eight files. One run exposed a missing `matchMedia`
fallback; another confirmed and fixed Folio 01's process anchor. `pnpm build`
passes, generating ten registry JSON files and 26 static pages. Vite reports
its existing CJS Node API deprecation warning. The public registry CLI install
and manual assistive-technology checks remain outstanding.

## Next steps

1. Check the public deploy after the push, then verify registry JSON and try a
   real shadcn CLI install as a consumer.
2. Keep the daily cap and report the requested schedule as inactive until a
   recurring automation surface is available.

The local Next development preview is at `http://localhost:3000`. Public deploy
status was not checked. The separate `gear5/` app remains a historical project.
