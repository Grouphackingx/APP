'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getEvents, deleteEvent } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { CreateEventForm } from '../../components/CreateEventForm';
import { EditEventForm } from '../../components/EditEventForm';

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
  const [view, setView] = useState<'dashboard' | 'events' | 'create' | 'edit'>('dashboard');
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVOS' | 'BORRADOR' | 'INACTIVOS'>('ACTIVOS');

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

  const filteredEvents = events.filter((e) => {
    if (activeTab === 'ACTIVOS') return e.status === 'PUBLISHED';
    if (activeTab === 'INACTIVOS') return e.status === 'INACTIVE';
    return e.status === 'DRAFT' || !e.status; // BORRADOR
  });

  const handleEventCreatedOrUpdated = () => {
    setView('events');
    fetchEvents();
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await deleteEvent(id, token);
        fetchEvents();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el evento');
      }
    }
  };

  if (user && user.role === 'HOST' && user.organizerProfile?.status !== 'APPROVED') {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} activeView="dashboard" onNavigate={()=>{}} onLogout={logout} />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '3rem', margin: '1rem 0' }}>⏳</div>
            <h2>Cuenta en Revisión</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Tu organización está siendo evaluada por el equipo de OpenTicket. Te notificaremos cuando tu acceso sea aprobado.
            </p>
            <button className="btn btn-secondary" onClick={logout} style={{ width: '100%' }}>
              ← Cerrar Sesión y Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <h1>Inicio</h1>
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
              <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setView('events')}>
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

            {/* Quick Actions */}
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                <h2>⚡ Accesos Rápidos</h2>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setView('create')}>
                  ➕ Crear Nuevo Evento
                </button>
                <button className="btn btn-secondary" onClick={() => setView('events')}>
                  🎪 Ver Mis Eventos
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'events' && (
          <>
            <div className="page-header">
              <div>
                <h1>Mis Eventos</h1>
                <p>Gestiona todos tus eventos publicados, borradores e inactivos.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setView('create')}
              >
                ➕ Crear Evento
              </button>
            </div>

            <div className="table-container">
              <div className="tabs-container" style={{ padding: '0 1.5rem', paddingTop: '1rem' }}>
                <button 
                  className={`tab-btn ${activeTab === 'ACTIVOS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ACTIVOS')}
                >
                  Activos ({events.filter(e => e.status === 'PUBLISHED').length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'INACTIVOS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('INACTIVOS')}
                >
                  Inactivos ({events.filter(e => e.status === 'INACTIVE').length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'BORRADOR' ? 'active' : ''}`}
                  onClick={() => setActiveTab('BORRADOR')}
                >
                  Borrador ({events.filter(e => e.status === 'DRAFT' || !e.status).length})
                </button>
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
              ) : filteredEvents.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <p>No hay eventos en esta pestaña.</p>
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
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => {
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
                              className={`status-badge ${event.status === 'PUBLISHED' ? 'status-published' : event.status === 'INACTIVE' ? 'status-inactive' : 'status-draft'}`}
                            >
                              {event.status === 'PUBLISHED'
                                ? '🟢 Activo'
                                : event.status === 'INACTIVE'
                                  ? '🔴 Inactivo'
                                  : '📝 Borrador'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEdit(event)}
                                title="Editar Evento"
                              >
                                ✏️
                              </button>
                              {eventSold === 0 && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(event.id)}
                                  title="Eliminar Evento"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
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
                onClick={() => setView('events')}
              >
                ← Volver a Mis Eventos
              </button>
            </div>
            <CreateEventForm token={token!} onSuccess={handleEventCreatedOrUpdated} />
          </>
        )}

        {view === 'edit' && editingEvent && (
          <>
            <div className="page-header">
              <div>
                <h1>Editar Evento</h1>
                <p>
                  Actualiza los detalles básicos de tu evento.
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setView('events')}
              >
                ← Volver a Mis Eventos
              </button>
            </div>
            <EditEventForm
              token={token!}
              initialData={editingEvent}
              onSuccess={handleEventCreatedOrUpdated}
            />
          </>
        )}
      </div>
    </div>
  );
}
