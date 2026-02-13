import { getEventById } from '../../../lib/api';
import { EventDetailClient } from './EventDetailClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
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

  if (error || !event) {
    return (
      <div
        className="event-detail"
        style={{ textAlign: 'center', paddingTop: '10rem' }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h1 style={{ marginBottom: '1rem' }}>Evento no encontrado</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {error}
        </p>
        <Link href="/" className="btn btn-primary">
          ← Volver a Eventos
        </Link>
      </div>
    );
  }

  return <EventDetailClient event={event} />;
}
