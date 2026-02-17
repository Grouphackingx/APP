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
        totalAmount: number;
        tickets: EnrichedTicket[];
        orderIds: string[];
      }
    >,
  );

  const eventGroups = Object.values(groupedEvents);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

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
                          <span>📍 {group.eventLocation}</span>
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
                      {group.tickets.map((ticket, tIdx) => (
                        <div
                          key={ticket.id || tIdx}
                          className={`ticket-card ${
                            ticket.status === 'USED'
                              ? 'ticket-used'
                              : 'ticket-valid'
                          }`}
                        >
                          <div className="ticket-top">
                            <div className="ticket-badge-row">
                              <span
                                className={`ticket-status-badge ${
                                  ticket.status === 'VALID'
                                    ? 'badge-valid'
                                    : ticket.status === 'USED'
                                      ? 'badge-used'
                                      : 'badge-default'
                                }`}
                              >
                                {ticket.status === 'VALID'
                                  ? '✅ Válido'
                                  : ticket.status === 'USED'
                                    ? '✔️ Usado'
                                    : ticket.status}
                              </span>
                            </div>
                            <div className="ticket-info-grid">
                              <div className="ticket-info-item">
                                <span className="ticket-info-label">Zona</span>
                                <span className="ticket-info-value">
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
                                📱 Escaneado: {formatDateTime(ticket.scannedAt)}
                              </div>
                            )}
                          </div>

                          {/* QR Code - Real */}
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
                          <div className="ticket-footer">
                            <span>ID: {ticket.id.slice(0, 12)}...</span>
                            {group.eventId && (
                              <Link
                                href={`/events/${group.eventId}`}
                                className="ticket-link"
                              >
                                Ver Evento →
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
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
