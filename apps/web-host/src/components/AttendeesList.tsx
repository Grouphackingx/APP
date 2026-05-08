'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAttendees } from '../lib/api';

interface TicketEntry {
  ticketId: string;
  status: string;
  scannedAt: string | null;
  zoneName: string;
  seatNumber: string | number | null;
}

interface AttendeeEntry {
  user: { id: string; name: string; email: string; phone: string | null; avatarUrl: string | null };
  eventId: string;
  eventTitle: string;
  ticketsBought: number;
  ticketsUsed: number;
  tickets: TicketEntry[];
}

interface AttendeesListProps {
  token: string;
}

function formatDateTime(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-EC', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AttendanceStatus({ bought, used }: { bought: number; used: number }) {
  if (used === 0) return <span style={{ color: '#ef4444', fontWeight: 600 }}>🔴 Sin asistir</span>;
  if (used < bought) return <span style={{ color: '#f59e0b', fontWeight: 600 }}>🔶 Parcial</span>;
  return <span style={{ color: '#6AC44D', fontWeight: 600 }}>✅ Completa</span>;
}

export function AttendeesList({ token }: AttendeesListProps) {
  const [attendees, setAttendees] = useState<AttendeeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    getAttendees(token)
      .then(setAttendees)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const eventOptions = useMemo(() => {
    const titles = new Map<string, string>();
    attendees.forEach((a) => titles.set(a.eventId, a.eventTitle));
    return Array.from(titles.entries());
  }, [attendees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return attendees.filter((a) => {
      const matchEvent = !selectedEvent || a.eventId === selectedEvent;
      const matchSearch =
        !q ||
        a.user.name.toLowerCase().includes(q) ||
        a.user.email.toLowerCase().includes(q);
      return matchEvent && matchSearch;
    });
  }, [attendees, search, selectedEvent]);

  const totalBought = filtered.reduce((s, a) => s + a.ticketsBought, 0);
  const totalUsed = filtered.reduce((s, a) => s + a.ticketsUsed, 0);
  const uniqueBuyers = new Set(filtered.map((a) => a.user.id)).size;

  const rowKey = (a: AttendeeEntry) => `${a.user.id}-${a.eventId}`;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ marginTop: '1rem' }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        />
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            minWidth: '200px',
          }}
        >
          <option value="">Todos los eventos</option>
          {eventOptions.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{uniqueBuyers}</div>
          <div className="stat-label">Compradores</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-value">{totalBought}</div>
          <div className="stat-label">Entradas Vendidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: '#6AC44D' }}>{totalUsed}</div>
          <div className="stat-label">Asistencias</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{totalBought - totalUsed}</div>
          <div className="stat-label">Sin Asistir</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay asistentes</h3>
            <p>
              {attendees.length === 0
                ? 'Aún no se han vendido entradas para tus eventos.'
                : 'No hay resultados para tu búsqueda.'}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Comprador</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Evento</th>
                <th style={{ textAlign: 'center' }}>Compradas</th>
                <th style={{ textAlign: 'center' }}>Utilizadas</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const key = rowKey(a);
                const isExpanded = expandedRow === key;
                return (
                  <>
                    <tr
                      key={key}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedRow(isExpanded ? null : key)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {a.user.avatarUrl ? (
                            <img
                              src={a.user.avatarUrl}
                              alt=""
                              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--color-primary)', color: '#000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                              }}
                            >
                              {a.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontWeight: 600 }}>{a.user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {a.user.email}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {a.user.phone || '-'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.eventTitle}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{a.ticketsBought}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: '#6AC44D' }}>{a.ticketsUsed}</td>
                      <td>
                        <AttendanceStatus bought={a.ticketsBought} used={a.ticketsUsed} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${key}-detail`}>
                        <td colSpan={8} style={{ padding: 0, background: 'var(--bg-primary)' }}>
                          <div style={{ padding: '0.75rem 1.5rem 1rem 3.5rem' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, paddingBottom: '0.4rem' }}>Ticket ID</th>
                                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, paddingBottom: '0.4rem' }}>Zona</th>
                                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, paddingBottom: '0.4rem' }}>Asiento</th>
                                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, paddingBottom: '0.4rem' }}>Estado</th>
                                  <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, paddingBottom: '0.4rem' }}>Hora de escaneo</th>
                                </tr>
                              </thead>
                              <tbody>
                                {a.tickets.map((t) => (
                                  <tr key={t.ticketId}>
                                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                      {t.ticketId.slice(0, 8)}…
                                    </td>
                                    <td>{t.zoneName}</td>
                                    <td>{t.seatNumber ?? '-'}</td>
                                    <td>
                                      {t.status === 'USED' ? (
                                        <span style={{ color: '#6AC44D' }}>✅ Utilizado</span>
                                      ) : (
                                        <span style={{ color: '#f59e0b' }}>🔒 Válido</span>
                                      )}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                      {formatDateTime(t.scannedAt)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
