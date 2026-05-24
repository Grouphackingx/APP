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
  const title = `${event.title} — AfroEventos`;
  const description = (event.description || 'Descubre y compra tickets para este evento en AfroEventos.').slice(0, 200);
  const pageUrl = `${siteUrl}/eventos/${event.slug || event.id}`;
  const image = event.bannerImageUrl || event.squareImageUrl || event.portraitImageUrl || event.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      siteName: 'AfroEventos',
      ...(image && {
        images: [{
          url: image,
          width: 1200,
          height: 630,
          alt: event.title,
        }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
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

  return <EventDetailClient event={event} />;
}
