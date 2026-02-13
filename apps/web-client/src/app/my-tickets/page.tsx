'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getUserOrders } from '../../lib/api';
import Link from 'next/link';

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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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

      {/* Orders List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
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
          {orders.map((order, idx) => {
            const isExpanded = expandedOrder === order.id;
            const eventTitle = order.tickets[0]?.eventTitle || 'Evento';
            const eventDate = order.tickets[0]?.eventDate || '';
            const eventLocation = order.tickets[0]?.eventLocation || '';
            const eventId = order.tickets[0]?.eventId;

            return (
              <div
                key={order.id}
                className={`order-card animate-fade-in-up stagger-${Math.min(idx + 1, 6)}`}
              >
                {/* Order Header */}
                <div
                  className="order-card-header"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="order-event-info">
                    <div className="order-event-icon">🎵</div>
                    <div>
                      <h3>{eventTitle}</h3>
                      <div className="order-event-meta">
                        {eventDate && (
                          <span>
                            📅 {formatDate(eventDate)} ⏰{' '}
                            {formatTime(eventDate)}
                          </span>
                        )}
                        {eventLocation && <span>📍 {eventLocation}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="order-summary-right">
                    <div className="order-amount">
                      ${Number(order.totalAmount).toFixed(2)}
                    </div>
                    <div className="order-ticket-count">
                      {order.tickets.length}{' '}
                      {order.tickets.length === 1 ? 'ticket' : 'tickets'}
                    </div>
                    <div className="order-expand-icon">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {/* Order Details (expanded) */}
                {isExpanded && (
                  <div className="order-card-details animate-fade-in">
                    <div className="order-meta-row">
                      <span>
                        <strong>Orden:</strong> #{order.id.slice(0, 8)}
                      </span>
                      <span>
                        <strong>Fecha de compra:</strong>{' '}
                        {formatDateTime(order.createdAt)}
                      </span>
                      <span
                        className={`order-status ${
                          order.status === 'COMPLETED' ? 'status-completed' : ''
                        }`}
                      >
                        {order.status === 'COMPLETED'
                          ? '✅ Completada'
                          : order.status}
                      </span>
                    </div>

                    {/* Tickets */}
                    <div className="tickets-grid">
                      {order.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
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
                                  Asiento
                                </span>
                                <span className="ticket-info-value">
                                  {ticket.seatNumber || '-'}
                                </span>
                              </div>
                            </div>
                            {ticket.scannedAt && (
                              <div className="ticket-scanned">
                                📱 Escaneado: {formatDateTime(ticket.scannedAt)}
                              </div>
                            )}
                          </div>

                          {/* QR Code visual representation */}
                          <div className="ticket-qr-section">
                            <div className="ticket-qr-placeholder">
                              <div className="qr-icon">📱</div>
                              <span>Código QR</span>
                              <span className="qr-id">
                                #{ticket.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>

                          {/* Tear line */}
                          <div className="ticket-tear-line" />
                          <div className="ticket-footer">
                            <span>ID: {ticket.id.slice(0, 12)}...</span>
                            {eventId && (
                              <Link
                                href={`/events/${eventId}`}
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
