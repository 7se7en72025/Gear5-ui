import type { MetadataRoute } from "next";

import { components } from "./_components/registry";
import { SITE_URL } from "./_components/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, priority: 1 },
    { url: `${SITE_URL}/docs`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/components`, lastModified, priority: 0.8 },
    ...components.map((entry) => ({
      url: `${SITE_URL}/components/${entry.slug}`,
      lastModified,
      priority: 0.6,
    })),
  ];
}
