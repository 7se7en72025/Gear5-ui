# Gear5 UI

A shadcn/ui compatible component library built the design first way. Every component starts as an actual design in Figma before it becomes code, so you get real spacing decisions, real motion choices, and a consistent look instead of a copy paste job with different colors.

## Why this exists

Most UI kits feel the same because they all start from the same defaults. I come from a UI/UX design background (was a designer at DVM, BITS Pilani), so I wanted to build something where every component has a reason behind it. Why this padding, why this animation curve, why this hierarchy. Small things, but they add up to something that feels intentional instead of generic.

## What you get

- Components backed by an actual design system, not just guesses
- Full shadcn CLI support, so you own the code once you install it
- Motion done with Framer Motion, used to explain state changes, not just for show
- Copy paste friendly, works on top of your existing Tailwind setup
- Built dark mode first, with light mode fully supported too
- Accessible out of the box using Radix primitives underneath

## Install

```bash
npx shadcn@latest add https://gear5.dev/r/button.json
```

Or grab the install command for any component straight from the docs site.

## Getting started locally

```bash
git clone https://github.com/yourusername/gear5-ui.git
cd gear5-ui
pnpm install
pnpm dev
```

Then open `http://localhost:3000` to see everything with live previews.

## Components

| Component | What it does |
|---|---|
| `Button` | Comes with variants, sizes, and proper motion states |
| `Card` | A flexible container with elevation options |
| `Input` | Form input with built in validation states |
| ... | More being added, check the roadmap below |

*(keep updating this as you add components)*

## How components are designed

1. Motion should mean something, never add animation just to add it
2. Everything follows a consistent 4px/8px spacing grid
3. Accessibility isn't optional, proper contrast and focus states everywhere
4. Small pieces that combine well together instead of one giant rigid component

## What's next

- [ ] First 10 to 12 core components
- [ ] Public Figma file so people can see the design system itself
- [ ] Proper documentation site
- [ ] Discord for the community
- [ ] v1.0 release

## Contributing

Would genuinely love help on this. Please check the [Code of Conduct](./CODE_OF_CONDUCT.md) before opening a PR.

1. Fork it
2. Make a branch for your feature (`git checkout -b feature/your-idea`)
3. Commit your work
4. Push the branch
5. Open a PR and I'll take a look

## Built with

- Next.js (App Router)
- Tailwind CSS
- Radix UI
- Framer Motion
- TypeScript

## License

MIT, © [Your Name]

## Thanks to

Huge credit to [shadcn/ui](https://ui.shadcn.com) for basically making this whole ecosystem possible.

---

If this is useful to you, a star on the repo genuinely helps more people find it.