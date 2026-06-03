import type { MetadataRoute } from 'next';

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:4201';

// El panel de organizadores es una aplicación privada. Solo permitimos rastrear
// las páginas públicas de captación (registro / inicio de sesión); el resto se bloquea.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/register', '/login'],
      disallow: [
        '/dashboard',
        '/auth',
        '/reset-password',
        '/forgot-password',
      ],
    },
    sitemap: `${hostUrl}/sitemap.xml`,
    host: hostUrl,
  };
}
