import type { MetadataRoute } from "next";

/**
 * robots.ts — auto-serves /robots.txt
 *
 * Allows all search engines to index every public page.
 * Explicitly disallows API routes and any internal Next.js paths.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/", "/dashboard/"],
      },
    ],
    sitemap: "https://www.kbcompress.online/sitemap.xml",
  };
}
