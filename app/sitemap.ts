import type { MetadataRoute } from "next";

/**
 * sitemap.ts — auto-serves /sitemap.xml
 *
 * Routes verified against actual app/ directory:
 *   app/page.tsx                              → /
 *   app/compress-photo-nadra/page.tsx         → /compress-photo-nadra
 *   app/compress-photo-pakistan-passport/     → /compress-photo-pakistan-passport
 *   app/compress-photo-us-visa/               → /compress-photo-us-visa
 *   app/compress-photo-uk-visa/               → /compress-photo-uk-visa
 *   app/compress-photo-schengen-visa/         → /compress-photo-schengen-visa
 *   app/resume-photo-size-linkedin/           → /resume-photo-size-linkedin
 *   app/compress-photo-rozee-pk/              → /compress-photo-rozee-pk
 *   app/compress-signature-image/             → /compress-signature-image
 *
 * Excluded:
 *   /api/*    — not public SEO pages
 *   /_next/*  — internal Next.js routes
 */

const BASE = "https://www.kbcompress.online";

// Static date for the current content version — update when content changes.
const LAST_MOD = new Date("2026-09-30");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: LAST_MOD,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/compress-photo-nadra`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/compress-photo-pakistan-passport`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/compress-photo-us-visa`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/compress-photo-uk-visa`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/compress-photo-schengen-visa`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/resume-photo-size-linkedin`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compress-photo-rozee-pk`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/compress-signature-image`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
