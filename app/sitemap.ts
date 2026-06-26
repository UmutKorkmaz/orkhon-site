import type { MetadataRoute } from "next";

const BASE = "https://orkhon.umutkorkmaz.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
