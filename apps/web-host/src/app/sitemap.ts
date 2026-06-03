import type { MetadataRoute } from 'next';

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:4201';

// Solo las páginas públicas de captación de organizadores deben indexarse.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${hostUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${hostUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
