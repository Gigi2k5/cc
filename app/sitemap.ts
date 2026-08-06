import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** Site d'une seule page : une seule entrée, les sections sont des ancres. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
