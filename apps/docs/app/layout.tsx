import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-stack",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Handoff UI",
    template: "%s · Handoff UI",
  },
  description:
    "Accessible React components for agent apps. Approvals, tool calls, traces, diffs, and the rest of the interface around the loop.",
  openGraph: {
    title: "Handoff UI",
    description: "Accessible React components for agent apps.",
    type: "website",
  },
};

/**
 * Runs before paint so a dark mode visitor never sees a white flash. It has to
 * be an inline script rather than an effect, which fires after hydration.
 */
const themeScript = `
try {
  var stored = localStorage.getItem("handoff-theme");
  if (stored === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
  }
} catch (e) {
  document.documentElement.classList.add("dark");
}
`;

const NAV = [
  { href: "/components", label: "Components" },
  { href: "/docs", label: "Docs" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-chip focus:border focus:border-line focus:bg-panel focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-[13px] font-medium tracking-tight"
            >
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-accent"
              />
              handoff<span className="text-fg-faint">/ui</span>
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-chip px-2.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-panel hover:text-fg"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1">
              <a
                href="https://github.com/7se7en72025/NYXA-UI"
                className="hidden rounded-chip px-2.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-panel hover:text-fg sm:block"
              >
                GitHub
              </a>
              <ThemeToggle />
              <MobileNav items={NAV} />
            </div>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="mt-28 border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-[13px] text-fg-muted sm:flex-row sm:items-center">
            <p>MIT licensed. Built for agent apps, not chatbots.</p>
            <div className="flex gap-4 sm:ml-auto">
              <Link href="/components" className="transition-colors hover:text-fg">
                Components
              </Link>
              <Link href="/docs" className="transition-colors hover:text-fg">
                Docs
              </Link>
              <a
                href="https://github.com/7se7en72025/NYXA-UI"
                className="transition-colors hover:text-fg"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
