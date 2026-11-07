import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/marketing/site";

const PAGES = ["", "/features", "/about", "/pricing", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p === "/privacy" || p === "/terms" ? 0.3 : 0.7,
  }));
}
