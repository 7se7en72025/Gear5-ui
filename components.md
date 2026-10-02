# Components

Living decision record for Gear5's blocks. Each entry must help someone build
a real portfolio or launch page, feel distinct from the existing library, and
stay small enough to understand and make their own.

## Collection 01

| Block            | Page job                                                     | Interaction                                                                | State        |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------ |
| Orbit Hero       | Make the first impression                                    | Pointer-responsive orbital mark; two clear actions                         | Shipped      |
| Project Showcase | Tell the story behind one project                            | Native expandable case studies                                             | Shipped      |
| Project Gallery  | Let visitors scan real projects and open a chosen case study | Category filters, selected detail panel, arrow/Home/End project navigation | Shipped      |
| Feature Switcher | Show product features or a design process                    | Roving-focus tabs; caller-supplied preview                                 | Shipped      |
| Spotlight Bento  | Make a small product or studio story scannable               | Unequal editorial grid; reduced-motion-aware pointer spotlight; no hover-only content | Shipped |
| Pricing Switch   | Explain two offer levels clearly                             | Native monthly/yearly radios; explicit caller-supplied totals              | Shipped      |
| Testimonial Deck | Give proof of work a voice                                   | Manual wraparound; announced quote; focus stays in place                   | Shipped      |
| Folio 01         | Show a complete, replaceable designer portfolio              | Composes the five original page blocks and configurable contact            | Shipped      |

## Today's additions

Daily addition limit: two original components, checked against India time.
Project Gallery and Spotlight Bento are today's two; the recurring work cycle
can continue improving the site and its documentation without exceeding that
limit.

### Project Gallery

**Who it helps:** designers, studios, and makers with several distinct projects.

**Why it belongs:** Project Showcase is a single expanding case study. The
gallery makes work scannable across categories, shows one focused write-up at a
time, and works when a visitor prefers a keyboard.

**Acceptance bar:** native filter buttons; arrow and Home/End selection; stable
empty state; optional caller-provided visual and safe destination; one column on
small screens; no image or animation dependency. Let the consumer provide an
optimized local image, its dimensions, and its alt text inside `artwork`.

**Current implementation:** filters and card selection work independently;
the detail panel announces its update without stealing focus. The sample artwork
is embedded CSS, and custom artwork stays with the caller. The installed Next 16
guide required a client boundary at the top of this interactive component.

### Spotlight Bento

**Who it helps:** product teams and independent studios summarizing a process,
feature set, or service offer.

**Why it belongs:** Feature Switcher explains one item at a time. This grid
shows several related reasons together, gives the most important one more room,
and still reads like ordinary content without a pointer.

**Acceptance bar:** standard, wide, and tall spans; caller-supplied preview;
optional safe link; a restrained desktop-pointer spotlight; static touch and
reduced-motion behaviour; no autoplay, dependency, or hover-only information.

**Current implementation:** three flexible sizes and four sample tiles.
Keyboard users can reach linked tiles; unlinked features are articles, not fake
buttons. The pointer listener honors reduced-motion preference and touch input.
Its Next App Router entry now declares its client boundary explicitly.

## Component intake

Before building a proposal, look for the same job in the registry. Record the
user, page job, behaviour, responsive states, data contract, and alternatives
here. Prefer two complementary page jobs over two effects on the same button.
Research may inform the problem space; write original code, names, and art.

Reject a proposal when its only benefit is motion, it repeats an existing
block, needs surprise network access, or cannot be used with touch and a
keyboard. Keep dependencies at zero unless an independently useful primitive
cannot be built responsibly in the native platform.

## Next candidates

No third block is approved yet. Compare future ideas against incoming user
feedback and the existing component index before opening a proposal. Do not
fill a quota with interchangeable cards or effects.

## Research notes

- Vengeance UI's catalog groups live interaction demos by use: buttons, type,
  image interactions, layouts, motion, and backgrounds. Borrow the idea of
  browsing a real preview before install; all Gear5 implementation and visual
  direction stay original. [Catalog](https://www.vengenceui.com/components)
- The shadcn registry recommends descriptive block metadata, explicit file and
  dependency lists, and using the registry source path in component imports.
  [Registry guide](https://ui.shadcn.com/docs/registry/getting-started)
- Reduced-motion preferences are a user setting, not an animation opt-out
  afterthought. Keep the feature content present and remove pointer transforms
  or motion-driven state. [Motion accessibility guide](https://motion.dev/docs/react-accessibility)

Updated 2026-10-02. See `learnings.md` for dated product and engineering
observations, `HANDOFF.md` for current work, and `ROADMAP.md` for the next
approved milestone.
