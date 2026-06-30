import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://clickpost.ai";
  return [
    {
      url: base,
      lastModified: new Date("2026-06-22"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
