import type { MetadataRoute } from "next";
import { TOOLS } from "./lib/tools";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shofidev-tools.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/prayer`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ai`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolRoutes,
  ];
}

