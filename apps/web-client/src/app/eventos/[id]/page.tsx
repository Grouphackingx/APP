import type { Metadata } from 'next';
import { getEventById } from '../../../lib/api';
import { EventDetailClient } from './EventDetailClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  let event;
  try { event = await getEventById(id); } catch { /* not found */ }

  if (!event) return { title: 'Evento — AfroEventos' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const title = `${event.title} — AfroEventos`;
  const description = (event.description || 'Descubre y compra tickets para este evento en AfroEventos.').slice(0, 200);
  const pageUrl = `${siteUrl}/eventos/${event.slug || event.id}`;

  // Para previews sociales (WhatsApp, Facebook, etc.) usamos el endpoint OG que
  // convierte la imagen cuadrada 1:1 a JPEG — WhatsApp no renderiza WebP.
  const hasImage = !!(
    event.squareImageUrl ||
    event.bannerImageUrl ||
    event.imageUrl ||
    event.portraitImageUrl
  );
  const ogImage = hasImage
    ? `${apiBase}/og/${event.slug || event.id}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      siteName: 'AfroEventos',
      ...(ogImage && {
        images: [{
          url: ogImage,
          width: 1080,
          height: 1080,
          type: 'image/jpeg',
          alt: event.title,
        }],
      }),
    },
    twitter: {
      // Imagen 1:1 → 'summary' la muestra sin recortes (no la deforma como large_image)
      card: 'summary',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  let event;
  let error = '';

  try {
    event = await getEventById(id);
  } catch (e: any) {
    error = e.message || 'Evento no encontrado';
  }

  if (error || !event || event.status === 'INACTIVE') {
    return (
      <div
        className="event-detail"
        style={{ textAlign: 'center', paddingTop: '10rem' }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h1 style={{ marginBottom: '1rem' }}>
          {event?.status === 'INACTIVE' ? 'Evento Finalizado' : 'Evento no encontrado'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {event?.status === 'INACTIVE'
            ? 'Este evento ya se ha llevado a cabo o ya no está disponible.'
            : error}
        </p>
        <Link href="/" className="btn btn-primary">
          ← Volver a Eventos
        </Link>
      </div>
    );
  }

  // ── Structured Data (JSON-LD) — habilita rich results de eventos en Google ──
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200';
  const pageUrl = `${siteUrl}/eventos/${event.slug || event.id}`;
  const images = [
    event.bannerImageUrl,
    event.squareImageUrl,
    event.portraitImageUrl,
    event.imageUrl,
  ].filter(Boolean) as string[];

  const offers = (event.zones || []).map((z) => ({
    '@type': 'Offer',
    name: z.name,
    price: Number(z.price || 0).toFixed(2),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: pageUrl,
    validFrom: event.createdAt ? new Date(event.createdAt).toISOString() : undefined,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description:
      event.description || `Compra entradas para ${event.title} en AfroEventos.`,
    startDate: new Date(event.date).toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(images.length > 0 && { image: images }),
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        ...(event.city && { addressLocality: event.city }),
        ...(event.province && { addressRegion: event.province }),
        addressCountry: 'EC',
      },
    },
    url: pageUrl,
    organizer: {
      '@type': 'Organization',
      name:
        event.organizer?.organizerProfile?.organizationName ||
        event.organizer?.name ||
        'AfroEventos',
    },
    ...(offers.length > 0 && { offers }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetailClient event={event} />
    </>
  );
}
