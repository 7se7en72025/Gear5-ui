export const siteConfig = {
  name: "Gear5 UI",
  tagline: "Make the web feel something.",
  description:
    "Expressive React blocks for portfolios and product launches. Original interactions, live previews, and editable source. Built with React and Tailwind CSS.",
  repo: "https://github.com/7se7en72025/gear5-ui",
  keywords: [
    "React components",
    "animated UI",
    "portfolio template",
    "landing page blocks",
    "Tailwind CSS",
    "shadcn registry",
    "interactive components",
    "Gear5 UI",
  ],
} as const;
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}
