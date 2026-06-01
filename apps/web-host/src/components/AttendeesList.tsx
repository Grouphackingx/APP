'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAttendees } from '../lib/api';

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

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

const PAGE_SIZE = 20;

export function AttendeesList({ token }: AttendeesListProps) {
  const [attendees, setAttendees] = useState<AttendeeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Load all attendees at once (search/filter is client-side)
    getAttendees(token, 1, 10000)
      .then((res) => setAttendees(res.data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const eventOptions = useMemo(() => {
    const titles = new Map<string, string>();
    attendees.forEach((a) => titles.set(a.eventId, a.eventTitle));
    return Array.from(titles.entries());
  }, [attendees]);

  const filtered = useMemo(() => {
    setPage(1); // reset to page 1 when filter changes
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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalBought = filtered.reduce((s, a) => s + a.ticketsBought, 0);
  const totalUsed = filtered.reduce((s, a) => s + a.ticketsUsed, 0);
  const uniqueBuyers = new Set(filtered.map((a) => a.user.id)).size;

  const rowKey = (a: AttendeeEntry) => `${a.user.id}-${a.eventId}`;

  const getAttendanceLabel = (bought: number, used: number) => {
    if (used === 0) return 'Sin asistir';
    if (used < bought) return 'Parcial';
    return 'Completa';
  };

  const buildExportData = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Evento', 'Tickets Comprados', 'Tickets Utilizados', 'Estado de Asistencia'];
    const rows = filtered.map(a => [
      a.user.name,
      a.user.email,
      a.user.phone || '',
      a.eventTitle,
      a.ticketsBought,
      a.ticketsUsed,
      getAttendanceLabel(a.ticketsBought, a.ticketsUsed),
    ]);
    return { headers, rows };
  };

  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (filtered.length === 0) return;
    setExporting(format);
    const date = new Date().toISOString().slice(0, 10);
    const fileName = selectedEvent
      ? `asistentes_${eventOptions.find(([id]) => id === selectedEvent)?.[1]?.replace(/\s+/g, '_').slice(0, 30) ?? 'evento'}_${date}`
      : `asistentes_${date}`;
    try {
      const { headers, rows } = buildExportData();
      if (format === 'csv') {
        const csv = [headers, ...rows]
          .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
          .join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${fileName}.csv`; a.click();
        URL.revokeObjectURL(url);
      } else {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [28, 30, 16, 36, 16, 16, 18].map(w => ({ wch: w }));
        ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }) };
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Asistentes');
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }
    } finally {
      setExporting(null);
    }
  };

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
      {/* Filtros + Exportar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem',
          }}
        />
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{
            padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: '0.9rem', minWidth: '200px',
          }}
        >
          <option value="">Todos los eventos</option>
          {eventOptions.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>

        {/* Botones de exportación */}
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {(['csv', 'xlsx'] as const).map(fmt => {
            const isLoading = exporting === fmt;
            const disabled = !!exporting || filtered.length === 0;
            const isXlsx = fmt === 'xlsx';
            return (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={disabled}
                title={
                  filtered.length === 0
                    ? 'Sin datos para exportar'
                    : selectedEvent || search
                      ? `Exportar ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} filtrados como ${fmt.toUpperCase()}`
                      : `Exportar todos los asistentes como ${fmt.toUpperCase()}`
                }
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${disabled ? 'var(--border-color)' : isXlsx ? 'rgba(107,114,228,0.5)' : 'rgba(106,196,77,0.5)'}`,
                  background: disabled ? 'transparent' : isXlsx ? 'rgba(107,114,228,0.08)' : 'rgba(106,196,77,0.08)',
                  color: disabled ? 'var(--text-muted)' : isXlsx ? '#818cf8' : '#6AC44D',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <DownloadIcon />
                {isLoading ? 'Exportando...' : fmt.toUpperCase()}
              </button>
            );
          })}
        </div>
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
              {paginated.map((a) => {
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ opacity: page === 1 ? 0.4 : 1 }}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {page} / {totalPages} · {filtered.length} asistentes
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ opacity: page === totalPages ? 0.4 : 1 }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
