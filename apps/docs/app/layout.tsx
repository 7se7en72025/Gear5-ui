import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SITE_URL as siteUrl } from "./_components/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const title = "Gear5 UI";
const description =
  "Headless, accessible React primitives for agent applications — tool calls, approvals, traces, and diffs.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${title} — components for agent interfaces`,
    template: "%s · Gear5 UI",
  },
  description,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

/**
 * Applied before first paint so a light-theme reader never sees a dark flash.
 * Dark is the default because that is where agent tooling lives.
 */
const THEME_SCRIPT = `
try {
  var stored = localStorage.getItem("gear5-theme");
  var dark = stored ? stored === "dark" : true;
  document.documentElement.classList.toggle("dark", dark);
} catch (e) {
  document.documentElement.classList.add("dark");
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable}`}
      // The inline theme script below mutates this element's class list
      // before React hydrates, so client and server markup legitimately
      // disagree on `dark` — that mismatch is expected, not a bug.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
