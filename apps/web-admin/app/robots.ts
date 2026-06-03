import type { MetadataRoute } from 'next';

// El panel de administración global es 100% privado.
// Bloqueamos por completo el rastreo de buscadores.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
