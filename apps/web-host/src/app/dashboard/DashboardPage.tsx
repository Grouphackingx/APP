'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getEvents, createEvent } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { CreateEventForm } from '../../components/CreateEventForm';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'create'>('dashboard');

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getEvents(token);
      setEvents(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalSeats = events.reduce(
    (sum, e) =>
      sum +
      (e.zones || []).reduce(
        (zs: number, z: any) => zs + (z.seats?.length || z.capacity || 0),
        0,
      ),
    0,
  );

  const soldSeats = events.reduce(
    (sum, e) =>
      sum +
      (e.zones || []).reduce(
        (zs: number, z: any) =>
          zs + (z.seats?.filter((s: any) => s.isSold)?.length || 0),
        0,
      ),
    0,
  );

  const totalRevenue = events.reduce(
    (sum, e) =>
      sum +
      (e.zones || []).reduce(
        (zs: number, z: any) =>
          zs +
          (z.seats?.filter((s: any) => s.isSold)?.length || 0) *
            Number(z.price || 0),
        0,
      ),
    0,
  );

  const handleEventCreated = () => {
    setView('dashboard');
    fetchEvents();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        user={user}
        activeView={view}
        onNavigate={setView}
        onLogout={logout}
      />

      <div className="main-content animate-fade-in">
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <div>
                <h1>Dashboard</h1>
                <p>
                  Bienvenido, {user?.name}. Aquí está el resumen de tus eventos.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setView('create')}
              >
                ➕ Crear Evento
              </button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{events.length}</div>
                <div className="stat-label">Eventos Creados</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎫</div>
                <div className="stat-value">{soldSeats}</div>
                <div className="stat-label">Tickets Vendidos</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🪑</div>
                <div className="stat-value">{totalSeats}</div>
                <div className="stat-label">Asientos Totales</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value" style={{ color: '#22D3EE' }}>
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="stat-label">Ingresos Totales</div>
              </div>
            </div>

            {/* Events Table */}
            <div className="table-container">
              <div className="table-header">
                <h2>🎪 Mis Eventos</h2>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner" />
                </div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎪</div>
                  <h3>Aún no tienes eventos</h3>
                  <p>Crea tu primer evento y empieza a vender tickets.</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => setView('create')}
                  >
                    ➕ Crear Evento
                  </button>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Fecha</th>
                      <th>Ubicación</th>
                      <th>Zonas</th>
                      <th>Vendidos</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => {
                      const eventSeats = (event.zones || []).reduce(
                        (s: number, z: any) =>
                          s + (z.seats?.length || z.capacity || 0),
                        0,
                      );
                      const eventSold = (event.zones || []).reduce(
                        (s: number, z: any) =>
                          s +
                          (z.seats?.filter((seat: any) => seat.isSold)
                            ?.length || 0),
                        0,
                      );
                      return (
                        <tr key={event.id}>
                          <td style={{ fontWeight: 600 }}>{event.title}</td>
                          <td>{formatDate(event.date)}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {event.location}
                          </td>
                          <td>{event.zones?.length || 0}</td>
                          <td>
                            <span
                              style={{
                                color:
                                  eventSold > 0
                                    ? '#22D3EE'
                                    : 'var(--text-muted)',
                              }}
                            >
                              {eventSold}/{eventSeats}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${event.status === 'PUBLISHED' ? 'status-published' : 'status-draft'}`}
                            >
                              {event.status === 'PUBLISHED'
                                ? '🟢 Publicado'
                                : '📝 Borrador'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {view === 'create' && (
          <>
            <div className="page-header">
              <div>
                <h1>Crear Nuevo Evento</h1>
                <p>
                  Completa los detalles de tu evento y define las zonas de
                  asientos.
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setView('dashboard')}
              >
                ← Volver al Dashboard
              </button>
            </div>
            <CreateEventForm token={token!} onSuccess={handleEventCreated} />
          </>
        )}
      </div>
    </div>
  );
}
