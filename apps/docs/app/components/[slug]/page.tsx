"use client";

import Link from "next/link";
import { OnePieceBackground } from "../../../../packages/core/src/one-piece-background";

export default function OnePieceBackgroundDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <Link href="/components" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← Back to Components
        </Link>
        <h1 className="mb-2 text-4xl font-bold">One Piece Background</h1>
        <p className="mb-8 text-muted-foreground">
          Animated ocean sunset background with layered waves and atmospheric effects.
        </p>
      </div>

      <div className="mx-8 overflow-hidden rounded-xl border">
        <OnePieceBackground className="h-[600px]">
          <div className="flex h-full flex-col items-center justify-center text-white">
            <h2 className="text-4xl font-bold">Grand Line Awaits</h2>
            <p className="mt-2 text-white/80">Sample content over the animated background</p>
          </div>
        </OnePieceBackground>
      </div>
    </div>
  );
}