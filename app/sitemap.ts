import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.kbcompress.online";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/compress-photo-pakistan-passport`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/compress-signature-image`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/resume-photo-size-linkedin`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/schengen-visa`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk-visa`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/us-visa`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/rozee-pk`,
      lastModified: new Date(),
    },
  ];
}