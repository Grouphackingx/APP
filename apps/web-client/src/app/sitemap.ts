import type { MetadataRoute } from 'next';
import { getEvents } from '../lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200';

// La ruta es dinámica (getEvents usa cache: 'no-store'): el sitemap se genera
// fresco en cada rastreo, reflejando siempre los eventos publicados actuales.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/politicas-de-privacidad`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terminos-y-condiciones`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    // El endpoint /events ya filtra solo PUBLISHED. Traemos un lote grande.
    const result = await getEvents(undefined, 1, 1000);
    eventRoutes = result.data.map((e) => ({
      url: `${siteUrl}/eventos/${e.slug || e.id}`,
      lastModified: e.createdAt ? new Date(e.createdAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch {
    // Si el API falla, devolvemos al menos las rutas estáticas
  }

  return [...staticRoutes, ...eventRoutes];
}
