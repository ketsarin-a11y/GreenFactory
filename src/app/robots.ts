import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/marketing/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/platform", "/company", "/manager", "/operator", "/scan", "/api", "/login", "/forgot-password", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
