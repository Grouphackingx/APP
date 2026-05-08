'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getUserOrders } from '../../lib/api';
import Link from 'next/link';
import QRCode from '../../components/QRCode';
import './my-tickets.css';

interface EnrichedTicket {
  id: string;
  qrCodeToken: string;
  status: string;
  scannedAt: string | null;
  eventId: string | null;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventCity?: string;
  zoneName: string;
  hasSeatingChart?: boolean;
  seatNumber: string;
}

interface OrderWithTickets {
  id: string;
  totalAmount: number | string;
  status: string;
  paymentRef: string | null;
  createdAt: string;
  tickets: EnrichedTicket[];
}

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Curated palette for high contrast and distinctiveness
const ZONE_COLORS = [
  '#3B82F6', // Blue 500
  '#EF4444', // Red 500
  '#10B981', // Emerald 500
  '#F59E0B', // Amber 500
  '#8B5CF6', // Violet 500
  '#EC4899', // Pink 500
  '#06B6D4', // Cyan 500
  '#F97316', // Orange 500
  '#6366F1', // Indigo 500
  '#14B8A6', // Teal 500
  // Additional 10 colors
  '#84CC16', // Lime 500
  '#A855F7', // Purple 500
  '#0EA5E9', // Sky 500
  '#EAB308', // Yellow 500
  '#F43F5E', // Rose 500
  '#22C55E', // Green 500
  '#64748B', // Slate 500 (distinct grey-blue)
  '#D946EF', // Fuchsia 500
  '#0F766E', // Teal 700 (Darker)
  '#B45309', // Amber 700 (Darker)
];

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ZONE_COLORS.length;
  return ZONE_COLORS[index];
}

export default function MyTicketsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithTickets[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchOrders() {
      if (!token) return;
      try {
        const data = await getUserOrders(token);
        setOrders(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  const totalTickets = orders.reduce((sum, o) => sum + o.tickets.length, 0);
  const validTickets = orders.reduce(
    (sum, o) => sum + o.tickets.filter((t) => t.status === 'VALID').length,
    0,
  );
  const usedTickets = orders.reduce(
    (sum, o) => sum + o.tickets.filter((t) => t.status === 'USED').length,
    0,
  );

  const groupedEvents = orders.reduce(
    (acc, order) => {
      if (!order.tickets || order.tickets.length === 0) return acc;

      // Assuming all tickets in an order belong to the same event
      const firstTicket = order.tickets[0];
      const eventId = firstTicket.eventId || 'unknown';

      if (!acc[eventId]) {
        acc[eventId] = {
          eventId,
          eventTitle: firstTicket.eventTitle || 'Evento Desconocido',
          eventDate: firstTicket.eventDate,
          eventLocation: firstTicket.eventLocation,
          eventCity: firstTicket.eventCity || '',
          totalAmount: 0,
          tickets: [],
          orderIds: [],
        };
      }

      acc[eventId].totalAmount += Number(order.totalAmount);
      acc[eventId].tickets.push(...order.tickets);
      acc[eventId].orderIds.push(order.id);

      return acc;
    },
    {} as Record<
      string,
      {
        eventId: string;
        eventTitle: string;
        eventDate: string;
        eventLocation: string;
        eventCity: string;
        totalAmount: number;
        tickets: EnrichedTicket[];
        orderIds: string[];
      }
    >,
  );

  const eventGroups = Object.values(groupedEvents);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const handleShare = async (ticket: EnrichedTicket, group: any) => {
    setSharingId(ticket.id);
    try {
      const eventUrl = `${window.location.origin}/events/${group.eventId}`;
      const shareTextBase = `\uD83C\uDFAB ¡Aquí tienes tu entrada para *${group.eventTitle}*!\n\uD83D\uDD17 Ver evento: ${eventUrl}\n\n\uD83D\uDCC5 Fecha: ${formatDate(group.eventDate)}\n\u23F0 Hora: ${formatTime(group.eventDate)}\n\uD83D\uDCCD Lugar: ${group.eventLocation}${group.eventCity ? `, ${group.eventCity}` : ''}\n\uD83C\uDF9F\uFE0F Zona: ${ticket.zoneName}\n\uD83D\uDCBA ${ticket.hasSeatingChart !== false ? 'Asiento' : 'Entrada'}: ${ticket.hasSeatingChart !== false ? ticket.seatNumber || '-' : `#${ticket.seatNumber}`}`;

      const longUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${ticket.qrCodeToken}`;
      let shortUrl = longUrl;
      try {
        const res = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: longUrl })
        });
        const data = await res.json();
        if (data.shortUrl) {
           shortUrl = data.shortUrl;
        }
      } catch (e) {
        console.error('Error shortening url', e);
      }

      const shareText = `${shareTextBase}\n\nMuestra este código QR en la puerta:\n${shortUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    } finally {
      setSharingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-tickets-page animate-fade-in">
        <div className="empty-state" style={{ paddingTop: '4rem' }}>
          <div className="empty-icon">🔐</div>
          <h3>Inicia sesión para ver tus tickets</h3>
          <p>Necesitas una cuenta para comprar y ver tus entradas.</p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              marginTop: '1.5rem',
            }}
          >
            <Link href="/login" className="btn btn-primary">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-tickets-page animate-fade-in">
      {/* Header */}
      <div className="my-tickets-header">
        <div>
          <h1>🎫 Mis Tickets</h1>
          <p>
            Aquí están todas las entradas que has adquirido,{' '}
            <strong>{user.name}</strong>.
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Explorar Eventos
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="my-tickets-stats">
        <div className="ticket-stat-card">
          <div className="ticket-stat-icon">📋</div>
          <div className="ticket-stat-value">{orders.length}</div>
          <div className="ticket-stat-label">Órdenes</div>
        </div>
        <div className="ticket-stat-card">
          <div className="ticket-stat-icon">🎫</div>
          <div className="ticket-stat-value">{totalTickets}</div>
          <div className="ticket-stat-label">Total Tickets</div>
        </div>
        <div className="ticket-stat-card">
          <div className="ticket-stat-icon">✅</div>
          <div
            className="ticket-stat-value"
            style={{ color: 'var(--color-success)' }}
          >
            {validTickets}
          </div>
          <div className="ticket-stat-label">Válidos</div>
        </div>
        <div className="ticket-stat-card">
          <div className="ticket-stat-icon">✔️</div>
          <div
            className="ticket-stat-value"
            style={{ color: 'var(--text-muted)' }}
          >
            {usedTickets}
          </div>
          <div className="ticket-stat-label">Usados</div>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : eventGroups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎪</div>
          <h3>Aún no tienes tickets</h3>
          <p>¡Explora eventos increíbles y compra tus primeras entradas!</p>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
          >
            🎫 Explorar Eventos
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {eventGroups.map((group, idx) => {
            const isExpanded = expandedEventId === group.eventId;

            return (
              <div
                key={group.eventId}
                className={`order-card animate-fade-in-up stagger-${Math.min(idx + 1, 6)}`}
              >
                {/* Event Header */}
                <div
                  className="order-card-header"
                  onClick={() =>
                    setExpandedEventId(isExpanded ? null : group.eventId)
                  }
                >
                  <div className="order-event-info">
                    <div className="order-event-icon">🎵</div>
                    <div>
                      <h3>{group.eventTitle}</h3>
                      <div className="order-event-meta">
                        {group.eventDate && (
                          <span>
                            📅 {formatDate(group.eventDate)} ⏰{' '}
                            {formatTime(group.eventDate)}
                          </span>
                        )}
                        {group.eventLocation && (
                          <span>
                            📍 {group.eventLocation}
                            {group.eventCity ? `, ${group.eventCity}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="order-summary-right">
                    <div className="order-amount">
                      ${group.totalAmount.toFixed(2)}
                    </div>
                    <div className="order-ticket-count">
                      {group.tickets.length}{' '}
                      {group.tickets.length === 1 ? 'ticket' : 'tickets'}
                    </div>
                    <div className="order-expand-icon">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {/* Event Details (expanded) */}
                {isExpanded && (
                  <div className="order-card-details animate-fade-in">
                    <div className="order-meta-row">
                      <span>
                        <strong>Event ID:</strong> {group.eventId.slice(0, 8)}
                        ...
                      </span>
                      <span>
                        <strong>Total Tickets:</strong> {group.tickets.length}
                      </span>
                    </div>

                    {/* Tickets */}
                    <div className="tickets-grid">
                      {group.tickets.map((ticket, tIdx) => {
                        const zoneColorRaw = stringToColor(ticket.zoneName);
                        // Ensure good contrast for text if used as background
                        const zoneColor = zoneColorRaw;

                        return (
                          <div
                            key={ticket.id || tIdx}
                            className={`ticket-card ${
                              ticket.status === 'USED'
                                ? 'ticket-used'
                                : 'ticket-valid'
                            }`}
                            style={{
                              borderTop: `6px solid ${zoneColor}`,
                              position: 'relative',
                            }}
                          >
                            <div className="ticket-top">
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '0.75rem',
                                }}
                              >
                                <span
                                  className={`ticket-status-badge ${
                                    ticket.status === 'VALID'
                                      ? 'badge-valid'
                                      : ticket.status === 'USED'
                                        ? 'badge-used'
                                        : 'badge-default'
                                  }`}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.5rem',
                                  }}
                                >
                                  {ticket.status === 'VALID'
                                    ? '✅ Válido'
                                    : ticket.status === 'USED'
                                      ? '🔒 Usado'
                                      : ticket.status}
                                </span>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    color: zoneColor,
                                    background: `${zoneColor}15`, // 15 = ~8% opacity
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '12px',
                                    border: `1px solid ${zoneColor}40`,
                                  }}
                                >
                                  {ticket.zoneName}
                                </div>
                              </div>
                              <div className="ticket-info-grid">
                                <div className="ticket-info-item">
                                  <span className="ticket-info-label">
                                    Zona
                                  </span>
                                  <span
                                    className="ticket-info-value"
                                    style={{ color: zoneColor }}
                                  >
                                    {ticket.zoneName}
                                  </span>
                                </div>
                                <div className="ticket-info-item">
                                  <span className="ticket-info-label">
                                    {ticket.hasSeatingChart !== false
                                      ? 'Asiento'
                                      : 'Entrada'}
                                  </span>
                                  <span className="ticket-info-value">
                                    {ticket.hasSeatingChart !== false
                                      ? ticket.seatNumber || '-'
                                      : `#${ticket.seatNumber}`}
                                  </span>
                                </div>
                              </div>
                              {ticket.scannedAt && (
                                <div className="ticket-scanned">
                                  📱 Escaneado:{' '}
                                  {formatDateTime(ticket.scannedAt)}
                                </div>
                              )}
                            </div>

                            {/* QR Code - Real */}
                            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              ID: {ticket.id.slice(0, 8)}...
                            </div>
                            <div className="ticket-qr-section">
                              <QRCode
                                value={ticket.qrCodeToken}
                                size={180}
                                ticketStatus={ticket.status}
                                ticketId={ticket.id}
                              />
                            </div>

                            {/* Tear line */}
                            <div className="ticket-tear-line" />
                            <div className="ticket-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <button
                                  onClick={() => handleShare(ticket, group)}
                                  disabled={sharingId === ticket.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: sharingId === ticket.id ? 'wait' : 'pointer',
                                    fontSize: '0.8rem',
                                    padding: 0,
                                    transition: 'color 0.2s',
                                    opacity: sharingId === ticket.id ? 0.7 : 1,
                                  }}
                                  title="Compartir por WhatsApp"
                                  onMouseOver={(e) => { if (sharingId !== ticket.id) e.currentTarget.style.color = '#25D366'; }}
                                  onMouseOut={(e) => { if (sharingId !== ticket.id) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                >
                                  {sharingId === ticket.id ? (
                                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'var(--text-secondary)', borderTopColor: 'transparent' }} />
                                  ) : (
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                    </svg>
                                  )}
                                  <span>Compartir</span>
                                </button>
                                
                                {group.eventId && (
                                  <Link
                                    href={`/events/${group.eventId}`}
                                    className="ticket-link"
                                    style={{ fontSize: '0.8rem' }}
                                  >
                                    Ver Evento →
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
