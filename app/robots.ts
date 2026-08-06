import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** /dev est la page de démo interne des primitives : jamais indexée. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/dev" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
