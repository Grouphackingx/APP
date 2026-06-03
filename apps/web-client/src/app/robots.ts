import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Páginas de cuenta/transacción: sin valor SEO y privadas
      disallow: [
        '/my-tickets',
        '/my-profile',
        '/verify-email',
        '/reset-password',
        '/forgot-password',
        '/login',
        '/register',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
