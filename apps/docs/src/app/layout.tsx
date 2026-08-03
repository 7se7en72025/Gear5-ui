import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bharat-ui — UI primitives for Indian fintech",
  description:
    "Copy-paste React components for UPI, PAN, Aadhaar, IFSC and GST inputs. Validation logic India actually needs, installed through the shadcn CLI.",
  keywords: ["UPI", "VPA", "India", "fintech", "React", "shadcn", "KYC"],
  openGraph: {
    title: "bharat-ui — UI primitives for Indian fintech",
    description:
      "Copy-paste React components for UPI, PAN, Aadhaar, IFSC and GST inputs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
