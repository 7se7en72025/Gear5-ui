import { allItems, installCommand } from "@/lib/registry";
import { getSiteUrl, siteConfig } from "@/lib/site";
export const dynamic = "force-static";
export function GET(): Response {
  const body = `# ${siteConfig.name}
> ${siteConfig.description}
React + Tailwind CSS 4. Copy-owned source. MIT licensed.
Getting started: ${getSiteUrl()}/getting-started
Template: ${getSiteUrl()}/templates/portfolio
Install blocks with shadcn. All labels/content are caller-editable.
Motion is decorative; reduced-motion and keyboard fallbacks are included.
Default projects, people, quotes and prices are examples. Replace before publishing.
${allItems.map((item) => `- ${item.title}: ${item.description}\n  install: ${installCommand(item.name)}`).join("\n")}
Machine-readable index: ${getSiteUrl()}/r/index.json
`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
