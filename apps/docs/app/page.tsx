"use client";

import { OnePieceBackground } from "../../../packages/core/src/one-piece-background";

export default function Home() {
  return (
    <OnePieceBackground>
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-white">
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          Gear5 UI
        </h1>
        <p className="mb-8 text-xl text-white/80 max-w-2xl text-center">
          A component library built the design first way.
          Every component starts as an actual design in Figma.
        </p>
        <div className="flex gap-4">
          <a
            href="/components"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-900 transition hover:bg-white/90"
          >
            Browse Components
          </a>
          <a
            href="https://github.com/yourusername/gear5-ui"
            className="rounded-lg border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            GitHub
          </a>
        </div>
      </div>
    </OnePieceBackground>
  );
}