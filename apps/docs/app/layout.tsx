import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Handoff UI — the UI layer for agent apps",
  description:
    "Accessible, streaming-aware React primitives for agent applications: approvals, tool calls, traces, and diffs.",
  openGraph: {
    title: "Handoff UI",
    description: "The UI layer for agent apps.",
    type: "website",
  },
};

/**
 * Applied before paint so a dark-mode visitor never sees a white flash. It runs
 * ahead of hydration, which is why it is an inline script rather than an effect.
 */
const themeScript = `
try {
  var stored = localStorage.getItem("handoff-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && prefersDark)) {
    document.documentElement.classList.add("dark");
  }
} catch {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
            <a href="/" className="font-mono text-sm font-semibold tracking-tight">
              handoff<span className="text-brand">/ui</span>
            </a>
            <nav className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#components" className="transition-colors hover:text-foreground">
                Components
              </a>
              <a
                href="https://github.com/handoff-ui/handoff-ui"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="mt-24 border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
            MIT licensed. Built for agent apps, not chatbots.
          </div>
        </footer>
      </body>
    </html>
  );
}
