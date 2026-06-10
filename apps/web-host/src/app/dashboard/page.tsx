'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getEvents, deleteEvent } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { CreateEventForm } from '../../components/CreateEventForm';
import { EditEventForm } from '../../components/EditEventForm';
import { AttendeesList } from '../../components/AttendeesList';
import { TicketScanner } from '../../components/TicketScanner';
import { OrganizerUsers } from '../../components/OrganizerUsers';
import { OrganizerProfile } from '../../components/OrganizerProfile';
import { EventPreviewModal } from '../../components/EventPreviewModal';
import { useConfirm, useToast } from '../../components/UIHelpers';
import { useRouter, useSearchParams } from 'next/navigation';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type View = 'dashboard' | 'events' | 'create' | 'edit' | 'attendees' | 'scanner' | 'users' | 'profile';
const VALID_VIEWS: View[] = ['dashboard', 'events', 'create', 'edit', 'attendees', 'scanner', 'users', 'profile'];

export default function DashboardPageWrapper() {
  return <Suspense><DashboardPage /></Suspense>;
}

function DashboardPage() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const { showConfirm, modalNode } = useConfirm();
  const { showToast, toastNode } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialView = ((): View => {
    const v = searchParams.get('view') as View;
    return VALID_VIEWS.includes(v) ? v : 'dashboard';
  })();
  const [view, setViewState] = useState<View>(initialView);

  const setView = (v: View) => {
    setViewState(v);
    router.replace(`/dashboard?view=${v}`, { scroll: false });
  };
  const navigate = (v: string) => setView(v as View);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [previewingEvent, setPreviewingEvent] = useState<any>(null);
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

  // Staff solo puede ver el escáner
  useEffect(() => {
    if (user?.isMember && user?.memberRole === 'STAFF') {
      setView('scanner');
    }
  }, [user]);

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

  const handleDelete = (id: string) => {
    if (!token) return;
    showConfirm(
      'Eliminar evento',
      '¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteEvent(id, token);
          fetchEvents();
        } catch (err: any) {
          showToast(err.message || 'Error al eliminar el evento.', 'error');
        }
      },
      'danger'
    );
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user && user.role === 'HOST' && user.organizerProfile?.status !== 'APPROVED') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 65% 15%, rgba(106,196,77,0.09) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(106,196,77,0.05) 0%, transparent 40%), #0a0d0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', opacity: 0.85 }}>
          <img src="/logo.svg" alt="AfroEventos" style={{ height: '36px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(17,19,24,0.97)',
          border: '1px solid rgba(106,196,77,0.15)',
          borderRadius: '20px',
          padding: '2.75rem 2.5rem',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.55)',
          textAlign: 'center',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.28)',
            color: '#f59e0b',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            padding: '5px 14px',
            borderRadius: '20px',
            marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: '13px' }}>⏳</span> Pendiente de aprobación
          </div>

          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            Solicitud recibida
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Recibimos la solicitud de <strong style={{ color: '#e5e7eb' }}>{user.organizerProfile?.organizationName || user.name}</strong>.
            Nuestro equipo revisará tu solicitud en la brevedad posible.
          </p>

          {/* Progress steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem', textAlign: 'left' }}>
            {[
              { icon: '✅', label: 'Solicitud enviada', sub: 'Tu información llegó correctamente a nuestro equipo.', active: true },
              { icon: '🔍', label: 'Revisión en proceso', sub: 'Verificará los datos de tu organización.', active: false },
              { icon: '🎉', label: 'Cuenta activada', sub: 'Recibirás un correo con acceso a tu panel de organizador.', active: false },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                padding: '14px 16px',
                background: step.active ? 'rgba(106,196,77,0.07)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${step.active ? 'rgba(106,196,77,0.2)' : 'rgba(55,65,81,0.35)'}`,
                borderRadius: '12px',
                opacity: step.active ? 1 : 0.55,
              }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: step.active ? 'rgba(106,196,77,0.15)' : 'rgba(55,65,81,0.3)',
                  border: `2px solid ${step.active ? '#6AC44D' : '#374151'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  flexShrink: 0,
                }}>
                  {step.active ? step.icon : <span style={{ color: '#6b7280', fontWeight: 700, fontSize: '12px' }}>{i + 1}</span>}
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: step.active ? '#e5e7eb' : '#9ca3af' }}>{step.label}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={logout} style={{ width: '100%' }}>
            ← Cerrar Sesión y Volver
          </button>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '12px', color: '#4b5563' }}>
          ¿Tienes dudas? Escríbenos a{' '}
          <a href="mailto:soporte@afroeventos.com" style={{ color: '#6AC44D', textDecoration: 'none' }}>soporte@afroeventos.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        user={user}
        activeView={view}
        onNavigate={navigate}
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
                                onClick={() => setPreviewingEvent(event)}
                                title="Previsualizar como lo ven los asistentes"
                                style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)' }}
                              >
                                👁️
                              </button>
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
            <CreateEventForm
              token={token!}
              onSuccess={handleEventCreatedOrUpdated}
              onPreview={(event) => {
                setPreviewingEvent(event);
                fetchEvents();
              }}
            />
          </>
        )}

        {view === 'scanner' && token && (
          <>
            <div className="page-header">
              <div>
                <h1>Escáner de Tickets</h1>
                <p>Valida el acceso de los asistentes escaneando su código QR.</p>
              </div>
            </div>
            <TicketScanner token={token} />
          </>
        )}

        {view === 'users' && token && !user?.isMember && (
          <>
            <div className="page-header">
              <div>
                <h1>Usuarios</h1>
                <p>Gestiona los usuarios adicionales que pueden acceder a este panel.</p>
              </div>
            </div>
            <OrganizerUsers token={token} />
          </>
        )}

        {view === 'profile' && token && (
          <>
            <div className="page-header">
              <div>
                <h1>Perfil</h1>
                <p>Actualiza tu información personal, datos de la organización y contraseña.</p>
              </div>
            </div>
            <OrganizerProfile token={token} />
          </>
        )}

        {view === 'attendees' && token && (
          <>
            <div className="page-header">
              <div>
                <h1>Asistentes</h1>
                <p>Compradores de entradas y registro de asistencia a tus eventos.</p>
              </div>
            </div>
            <AttendeesList token={token} />
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
      {modalNode}
      {toastNode}
      {previewingEvent && (
        <EventPreviewModal event={previewingEvent} onClose={() => setPreviewingEvent(null)} />
      )}

      <a
        href="https://wa.me/593988996579"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Soporte por WhatsApp"
        className="whatsapp-fab"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="whatsapp-fab-label">Soporte</span>
      </a>
    </div>
  );
}
