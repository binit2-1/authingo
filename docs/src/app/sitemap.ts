import type { MetadataRoute } from "next";
import { playgrounds } from "@/lib/playgrounds";
import { absoluteUrl } from "@/lib/seo";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/playground"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/changelog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    ...playgrounds.map((playground) => ({
      url: absoluteUrl(`/playground/${playground.id}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: playground.id === "basic" ? 0.75 : 0.6,
    })),
    ...source.getPages().map((page) => ({
      url: absoluteUrl(page.url),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.url === "/docs" ? 0.9 : 0.7,
    })),
  ];

  return Array.from(
    new Map(routes.map((route) => [route.url, route])).values(),
  );
}
