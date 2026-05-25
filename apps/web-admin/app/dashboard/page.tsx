'use client';

import { useEffect, useState, useRef } from 'react';
import { getOrganizers, setOrganizerStatus, deleteOrganizer, updateOrganizer, createOrganizer, getPlans, createPlan, updatePlan, deletePlan, getOrganizersAnalytics, getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, uploadImage, getAllEventsAdmin, setEventFeatured, deleteEvent, getBannersAdmin, createBanner, updateBanner, deleteBanner, uploadBannerImage, type Banner } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { EditEventForm } from '../../components/EditEventForm';

export default function AdminDashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'inicio' | 'dashboard' | 'users' | 'plans' | 'analytics' | 'events' | 'edit-event' | 'banners'>('inicio');
  const [events, setEvents] = useState<any[]>([]);
  const [activeEventTab, setActiveEventTab] = useState<'ACTIVOS' | 'BORRADOR' | 'INACTIVOS'>('ACTIVOS');
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingOrgData, setEditingOrgData] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({});
  
  const [plans, setPlans] = useState<any[]>([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [editingPlanData, setEditingPlanData] = useState<any>(null);
  const [planFormData, setPlanFormData] = useState<any>({});

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUserData, setEditingUserData] = useState<any>(null);
  const [userFormData, setUserFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  const editLogoInputRef = useRef<HTMLInputElement>(null);
  const createLogoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleEditLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingLogo(true);
    try {
      const orgId = editingOrgData.id;
      const url = await uploadImage(file, token, 'logo', undefined, orgId);
      setEditFormData(prev => ({ ...prev, organizationLogo: url }));
    } catch (err: any) {
      alert(err.message || 'Error al subir el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCreateLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingLogo(true);
    try {
      const tempId = createFormData.email ? createFormData.email.replace(/[^a-zA-Z0-9]/g, '_') : 'temp_' + Date.now();
      const url = await uploadImage(file, token, 'logo', undefined, tempId);
      setCreateFormData(prev => ({ ...prev, organizationLogo: url }));
    } catch (err: any) {
      alert(err.message || 'Error al subir el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR'))) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token || !user) return;
    loadOrganizers();
    loadAnalytics();
    if (user.role === 'ADMIN') {
      loadPlans();
      loadAdminUsers();
      loadEvents();
    } else if (user.role === 'EDITOR') {
      loadEvents();
    }
  }, [token, user]);

  const loadEvents = async () => {
    try {
      const data = await getAllEventsAdmin(token as string);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events', error);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    let duration = null;
    if (!currentStatus) {
      const promptRes = window.prompt('¿Por cuántos días quieres destacar este evento? (Ej: 7, 30)');
      if (promptRes === null) return;
      duration = parseInt(promptRes);
      if (isNaN(duration) || duration <= 0) {
        alert('Por favor ingresa un número de días válido.');
        return;
      }
    } else {
      if (!confirm('¿Deseas quitar este evento de destacados?')) return;
    }

    try {
      await setEventFeatured(id, !currentStatus, duration, token as string);
      loadEvents();
    } catch (err) {
      alert('Error al actualizar el estado de destacado.');
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setView('edit-event');
  };

  const handleEventUpdated = () => {
    setView('events');
    loadEvents();
  };

  const handleDeleteEvent = async (ev: any) => {
    const hasSoldSeats = (ev.zones || []).some((z: any) => (z.seats || []).some((s: any) => s.isSold));
    if (hasSoldSeats) {
      alert('No se puede eliminar este evento porque tiene tickets vendidos.');
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar el evento "${ev.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteEvent(ev.id, token as string);
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el evento.');
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await getOrganizersAnalytics(token as string);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics', error);
      setAnalyticsData([]); // Prevents infinite loading if error occurs
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const data = await getAdminUsers(token as string);
      setAdminUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await getPlans(token as string);
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans', error);
    }
  };

  const loadOrganizers = async () => {
    setLoading(true);
    try {
      const data = await getOrganizers(token as string);
      setOrganizers(data);
    } catch (error) {
      console.error('Failed to load organizers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'APPROVED' : currentStatus === 'APPROVED' ? 'REJECTED' : 'PENDING';
    
    if (!confirm(`¿Cambiar estado de este organizador a ${nextStatus}?`)) return;

    try {
      await setOrganizerStatus(id, nextStatus, token as string);
      loadOrganizers();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleEditOrg = (org: any) => {
    setEditingOrgData(org);
    setEditFormData({ ...org.organizerProfile, email: org.email });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { id, userId, createdAt, updatedAt, ...cleanData } = editFormData;
      await updateOrganizer(editingOrgData.id, cleanData, token as string);
      setEditingOrgData(null);
      loadOrganizers();
    } catch (err) {
      alert('Error actualizando organizador. Revisa los campos.');
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createOrganizer(createFormData, token as string);
      setIsCreatingOrg(false);
      setCreateFormData({});
      loadOrganizers();
    } catch (err: any) {
      alert(err.message || 'Error creando organizador.');
      setLoading(false);
    }
  };

  const handleDeleteOrg = async (id: string, name: string) => {
    if (!confirm(`¿Estás completamente seguro de borrar de forma permanente a ${name}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteOrganizer(id, token as string);
      loadOrganizers();
    } catch (err) {
      alert('No se pudo borrar el organizador o posee eventos asociados.');
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPlanData) {
        await updatePlan(editingPlanData.id, planFormData, token as string);
      } else {
        await createPlan(planFormData, token as string);
      }
      setIsCreatingPlan(false);
      setEditingPlanData(null);
      loadPlans();
    } catch (err: any) {
      alert(err.message || 'Error guardando plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`¿Borrar permanentemente el plan ${name}?`)) return;
    try {
      await deletePlan(id, token as string);
      loadPlans();
    } catch (err) {
      alert('Error eliminando plan');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      if (editingUserData) {
        await updateAdminUser(editingUserData.id, userFormData, token as string);
      } else {
        await createAdminUser(userFormData, token as string);
      }
      setIsCreatingUser(false);
      setEditingUserData(null);
      loadAdminUsers();
    } catch (err: any) {
      setFormError(err.message || 'Error guardando usuario. Verifica los datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === user?.id) {
      alert('No puedes eliminarte a ti mismo.');
      return;
    }
    if (!confirm(`¿Borrar permanentemente al usuario ${name}?`)) return;
    try {
      await deleteAdminUser(id, token as string);
      loadAdminUsers();
    } catch (err) {
      alert('Error eliminando usuario');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) return null;

  const totalOrgs = organizers.length;
  const approvedOrgs = organizers.filter(o => o.organizerProfile?.status === 'APPROVED').length;
  const pendingOrgs = organizers.filter(o => o.organizerProfile?.status === 'PENDING').length;
  const filteredEvents = events.filter((e) => {
    if (activeEventTab === 'ACTIVOS') return e.status === 'PUBLISHED';
    if (activeEventTab === 'INACTIVOS') return e.status === 'INACTIVE';
    return e.status === 'DRAFT' || !e.status;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar
        user={user}
        activeView={view}
        onNavigate={setView}
        onLogout={() => {
          logout();
          router.push('/login');
        }}
      />

      <div className="main-content animate-fade-in">
        {view === 'inicio' && (
          <>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h1>Panel de Resumen</h1>
                <p>Bienvenido al Sistema Central de AfroEventos. Aquí fluye el estado de toda la red.</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(0,0,0,0))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div className="stat-icon" style={{color: '#a855f7'}}>🎟️</div>
                <div className="stat-value" style={{color: '#c084fc'}}>Operativo</div>
                <div className="stat-label">Estado del Sistema</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value">{organizers.length}</div>
                <div className="stat-label">Organizaciones Totales Registradas</div>
              </div>
            </div>

            <div className="table-container" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🪐</div>
              <h2>Centro de Comando</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', marginTop: '1rem' }}>
                Utiliza el menú lateral para navegar entre la gestión de organizaciones productoras y la futura administración de usuarios finales.
              </p>
            </div>
          </>
        )}

        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <div>
                <h1>Gestión de Organizadores</h1>
                <p>Bienvenido, {user?.name}. Habilita, restringe y supervisa las empresas en la red.</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => { setCreateFormData({ status: 'APPROVED', plan: plans.length > 0 ? plans[0].name : '' }); setIsCreatingOrg(true); }}
                style={{ alignSelf: 'center' }}
              >
                + Crear Organizador
              </button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏢</div>
                <div className="stat-value">{totalOrgs}</div>
                <div className="stat-label">Organizaciones Totales</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{color: '#6EE7B7'}}>✅</div>
                <div className="stat-value" style={{color: '#6EE7B7'}}>{approvedOrgs}</div>
                <div className="stat-label">Organizadores Activos</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{color: '#FDE68A'}}>⏳</div>
                <div className="stat-value" style={{color: '#FDE68A'}}>{pendingOrgs}</div>
                <div className="stat-label">Solicitudes Pendientes</div>
              </div>
            </div>

            {/* Organizations Table */}
            <div className="table-container">
              <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                <h2>📋 Directorio de Organizadores</h2>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner" />
                </div>
              ) : organizers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏢</div>
                  <h3>Aún no hay organizadores</h3>
                  <p>Las organizaciones que se registren aparecerán aquí.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Organización / Representante</th>
                      <th>Contacto</th>
                      <th>Ubicación</th>
                      <th>Suscripción</th>
                      <th>Estado Actual</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizers.map((org) => {
                      const prof = org.organizerProfile;
                      if (!prof) return null;
                      return (
                        <tr key={org.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '8px', 
                                backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: '#a855f7', overflow: 'hidden'
                              }}>
                                {prof.organizationLogo ? (
                                  <img src={prof.organizationLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  prof.organizationName ? prof.organizationName.charAt(0).toUpperCase() : '?'
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prof.organizationName || 'Sin Nombre'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {prof.firstName} {prof.lastName} • ID: {prof.identificationNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{org.email}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tel: {prof.phone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {prof.city ? `${prof.city}, ${prof.province}` : 'No especificada'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {prof.address || 'Sin dirección física'}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                              backgroundColor: prof.plan === 'ELITE' ? 'rgba(168, 85, 247, 0.15)' : prof.plan === 'PLUS' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card-hover)',
                              color: prof.plan === 'ELITE' ? '#c084fc' : prof.plan === 'PLUS' ? '#38bdf8' : 'var(--text-muted)'
                            }}>
                              {prof.plan}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${prof.status === 'APPROVED' ? 'status-published' : prof.status === 'REJECTED' ? 'status-inactive' : 'status-draft'}`}
                              style={{
                                backgroundColor: prof.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : undefined,
                                color: prof.status === 'REJECTED' ? '#fca5a5' : undefined,
                              }}>
                              {prof.status === 'APPROVED' ? '🟢 Aprobado' : prof.status === 'REJECTED' ? '🔴 Rechazado' : '⏳ Pendiente'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleStatusChange(org.id, prof.status)}
                                title="Cambiar Estado"
                              >
                                {prof.status === 'PENDING' ? 'Aprobar' : 'Cambiar Estado'}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEditOrg(org)}
                                title="Editar Organización"
                                style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-color)' }}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleDeleteOrg(org.id, prof.organizationName)}
                                title="Eliminar"
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                              >
                                🗑️
                              </button>
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

        {view === 'events' && (
          <>
            <div className="page-header">
              <div>
                <h1>Gestión Global de Eventos</h1>
                <p>Explora y administra todos los eventos de la plataforma. Destaca los mejores para la página principal.</p>
              </div>
            </div>

            <div className="table-container">
              <div className="tabs-container" style={{ padding: '0 1.5rem', paddingTop: '1rem' }}>
                <button 
                  className={`tab-btn ${activeEventTab === 'ACTIVOS' ? 'active' : ''}`}
                  onClick={() => setActiveEventTab('ACTIVOS')}
                >
                  Activos ({events.filter(e => e.status === 'PUBLISHED').length})
                </button>
                <button 
                  className={`tab-btn ${activeEventTab === 'INACTIVOS' ? 'active' : ''}`}
                  onClick={() => setActiveEventTab('INACTIVOS')}
                >
                  Inactivos ({events.filter(e => e.status === 'INACTIVE').length})
                </button>
                <button 
                  className={`tab-btn ${activeEventTab === 'BORRADOR' ? 'active' : ''}`}
                  onClick={() => setActiveEventTab('BORRADOR')}
                >
                  Borrador ({events.filter(e => e.status === 'DRAFT' || !e.status).length})
                </button>
              </div>



              {loading && events.length === 0 ? (
                <div className="loading-container">
                  <div className="spinner" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎟️</div>
                  <h3>No hay eventos en esta categoría</h3>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Organizador</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Destacado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {ev.city ? `${ev.city}, ${ev.province}` : 'Sin ubicación'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {ev.organizer?.organizerProfile?.organizationName || 'Sin Nombre'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {new Date(ev.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${ev.status === 'PUBLISHED' ? 'status-published' : ev.status === 'INACTIVE' ? 'status-inactive' : 'status-draft'}`}>
                            {ev.status === 'PUBLISHED' ? '🟢 Activo' : ev.status === 'INACTIVE' ? '🔴 Inactivo' : '⏳ Borrador'}
                          </span>
                        </td>
                        <td>
                          {ev.isFeatured ? (
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                              ⭐ Destacado {ev.featuredUntil ? `(hasta ${new Date(ev.featuredUntil).toLocaleDateString()})` : ''}
                            </span>
                          ) : (
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                              Normal
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleToggleFeatured(ev.id, ev.isFeatured)}
                              title={ev.isFeatured ? "Quitar Destacado" : "Destacar Evento"}
                              style={{ 
                                backgroundColor: ev.isFeatured ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
                                borderColor: ev.isFeatured ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)', 
                                color: ev.isFeatured ? '#ef4444' : '#eab308' 
                              }}
                            >
                              {ev.isFeatured ? 'Quitar Destacado' : '⭐ Destacar'}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEditEvent(ev)}
                              title="Editar Evento"
                            >
                              ✏️
                            </button>
                            {!(ev.zones || []).some((z: any) => (z.seats || []).some((s: any) => s.isSold)) && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteEvent(ev)}
                                title="Eliminar Evento"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {view === 'edit-event' && editingEvent && (
          <>
            <div className="page-header">
              <div>
                <h1>Editar Evento (Admin)</h1>
                <p>Modifica el estado o cualquier detalle del evento.</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setView('events')}
              >
                ← Volver a Eventos
              </button>
            </div>
            <EditEventForm
              token={token!}
              initialData={editingEvent}
              onSuccess={handleEventUpdated}
            />
          </>
        )}

        {view === 'users' && user.role === 'ADMIN' && (
          <>
            <div className="page-header">
              <div>
                <h1>Gestión de Usuarios del Dashboard</h1>
                <p>Administradores y Editores con acceso al panel Global Admin.</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => { setFormError(null); setUserFormData({ role: 'EDITOR' }); setEditingUserData(null); setIsCreatingUser(true); }}
                style={{ alignSelf: 'center' }}
              >
                + Añadir Usuario
              </button>
            </div>
            
            <div className="table-container">
              <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                <h2>👥 Base de Datos de Usuarios</h2>
              </div>
              
              {loading && adminUsers.length === 0 ? (
                <div className="loading-container">
                  <div className="spinner" />
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🧑‍💻</div>
                  <h3>No hay usuarios</h3>
                  <p>Añade usuarios administradores o editores.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Contacto</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.email}</div>
                          {u.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tel: {u.phone}</div>}
                        </td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                            backgroundColor: u.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: u.role === 'ADMIN' ? '#c084fc' : '#38bdf8'
                          }}>
                            {u.role === 'ADMIN' ? '👑 ADMINISTRADOR' : '📝 EDITOR'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => { 
                                const [firstName, ...rest] = (u.name || '').split(' ');
                                setEditingUserData(u); 
                                setUserFormData({ ...u, firstName, lastName: rest.join(' ') }); 
                                setIsCreatingUser(true); 
                              }}
                              title="Editar"
                              style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-color)' }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Eliminar"
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {view === 'plans' && (
          <>
            <div className="page-header">
              <div>
                <h1>Gestión de Planes</h1>
                <p>Configura los planes de suscripción para los organizadores, definiendo sus beneficios y precios.</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => { setPlanFormData({}); setEditingPlanData(null); setIsCreatingPlan(true); }}
                style={{ alignSelf: 'center' }}
              >
                + Crear Plan
              </button>
            </div>

            <div className="table-container">
              <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                <h2>💎 Planes Disponibles</h2>
              </div>

              {loading && plans.length === 0 ? (
                <div className="loading-container">
                  <div className="spinner" />
                </div>
              ) : plans.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏷️</div>
                  <h3>No hay planes creados</h3>
                  <p>Agrega un nuevo plan para empezar a ofrecerlo a los organizadores.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Nombre del Plan</th>
                      <th>Nro. Publicaciones Máximas</th>
                      <th>Valor (Precio)</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{plan.name}</div>
                        </td>
                        <td>{plan.maxEvents === 0 ? '♾️ Ilimitados' : `${plan.maxEvents} eventos`}</td>
                        <td>${plan.price}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => { setEditingPlanData(plan); setPlanFormData(plan); setIsCreatingPlan(true); }}
                              title="Editar"
                              style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-color)' }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeletePlan(plan.id, plan.name)}
                              title="Eliminar"
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        {view === 'analytics' && (
          <>
            <div className="page-header">
              <div>
                <h1>Analíticas de Organizadores</h1>
                <p>Métricas detalladas sobre el desempeño y actividad comercial de cada productor en la plataforma.</p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => loadAnalytics()}
                style={{ alignSelf: 'center', backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-color)' }}
              >
                🔄 Actualizar
              </button>
            </div>

            {/* Global Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(0,0,0,0))' }}>
                <div className="stat-icon" style={{color: '#38bdf8'}}>🎟️</div>
                <div className="stat-value">{analyticsData.reduce((acc, curr) => acc + curr.eventsCount, 0)}</div>
                <div className="stat-label">Eventos Totales</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0,0,0,0))' }}>
                <div className="stat-icon" style={{color: '#a855f7'}}>🎫</div>
                <div className="stat-value">{analyticsData.reduce((acc, curr) => acc + curr.ticketsSold, 0)}</div>
                <div className="stat-label">Tickets Totales Vendidos</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(0,0,0,0))' }}>
                <div className="stat-icon" style={{color: '#fbbf24'}}>💰</div>
                <div className="stat-value" style={{color: '#fbbf24'}}>${analyticsData.reduce((acc, curr) => acc + curr.revenue, 0).toFixed(2)}</div>
                <div className="stat-label">Ingresos Totales Brutos</div>
              </div>
            </div>

            <div className="table-container">
              <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                <h2>📊 Rendimiento por Cuenta</h2>
              </div>

              {loadingAnalytics ? (
                <div className="loading-container">
                  <div className="spinner" />
                </div>
              ) : analyticsData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>No hay datos analíticos</h3>
                  <p>Aún no hay organizaciones registradas o no se pudieron cargar las analíticas.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Organización / Host</th>
                      <th style={{textAlign: 'center'}}>Plan Actual</th>
                      <th style={{textAlign: 'center'}}>Eventos Creados</th>
                      <th style={{textAlign: 'center'}}>Zonas Configuradas</th>
                      <th style={{textAlign: 'center'}}>Tickets Vendidos</th>
                      <th style={{textAlign: 'right'}}>Ingresos Generados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.map((org) => (
                      <tr key={org.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{org.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{org.email}</div>
                        </td>
                        <td style={{textAlign: 'center'}}>
                          <span style={{
                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                            backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)'
                          }}>
                            {org.plan}
                          </span>
                        </td>
                        <td style={{textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold'}}>{org.eventsCount}</td>
                        <td style={{textAlign: 'center', color: 'var(--text-secondary)'}}>{org.zonesCount}</td>
                        <td style={{textAlign: 'center', color: '#6EE7B7', fontWeight: 'bold'}}>{org.ticketsSold}</td>
                        <td style={{textAlign: 'right', fontWeight: 700, color: '#FDE68A'}}>${Number(org.revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {view === 'banners' && <BannersView token={token || ''} />}
      </div>

      {/* Edit Modal Overlay */}
      {editingOrgData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="auth-card animate-fade-in-up" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>✏️ Editar Organización</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Modifica los detalles de la organización y su representante.
            </p>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Correo Electrónico (Acceso)</label>
                <input type="email" value={editFormData.email || ''} onChange={e => setEditFormData({...editFormData, email: e.target.value})} required />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-glass)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px dashed var(--border-color)'
                }}>
                  {editFormData.organizationLogo ? (
                    <img src={editFormData.organizationLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>🏢</span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Logo de la Organización</label>
                  <input type="file" accept="image/*" ref={editLogoInputRef} style={{ display: 'none' }} onChange={handleEditLogoUpload} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => editLogoInputRef.current?.click()} disabled={uploadingLogo}>
                    {uploadingLogo ? 'Subiendo...' : 'Cambiar Imagen'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Nombre de la Organización</label>
                <input value={editFormData.organizationName || ''} onChange={e => setEditFormData({...editFormData, organizationName: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre Representante</label>
                  <input value={editFormData.firstName || ''} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Apellido Representante</label>
                  <input value={editFormData.lastName || ''} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={editFormData.phone || ''} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Cédula/RUC</label>
                  <input value={editFormData.identificationNumber || ''} onChange={e => setEditFormData({...editFormData, identificationNumber: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Provincia</label>
                  <input value={editFormData.province || ''} onChange={e => setEditFormData({...editFormData, province: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input value={editFormData.city || ''} onChange={e => setEditFormData({...editFormData, city: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={editFormData.address || ''} onChange={e => setEditFormData({...editFormData, address: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Plan / Suscripción</label>
                  <select value={editFormData.plan || ''} onChange={e => setEditFormData({...editFormData, plan: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }}>
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    {!plans.some(p => p.name === editFormData.plan) && editFormData.plan && (
                      <option value={editFormData.plan}>{editFormData.plan} (Heredado)</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado Activo</label>
                  <select value={editFormData.status || 'PENDING'} onChange={e => setEditFormData({...editFormData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }}>
                    <option value="PENDING">Pendiente</option>
                    <option value="APPROVED">Aprobado</option>
                    <option value="REJECTED">Rechazado</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Nueva Contraseña (Opcional)</label>
                <input type="text" placeholder="Dejar en blanco para mantener la actual" value={editFormData.password || ''} onChange={e => setEditFormData({...editFormData, password: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => setEditingOrgData(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal Overlay */}
      {isCreatingOrg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="auth-card animate-fade-in-up" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>➕ Crear Nuevo Organizador</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Registra manualmente una nueva empresa productora en la plataforma.
            </p>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Correo Electrónico (Acceso)</label>
                <input type="email" value={createFormData.email || ''} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Contraseña Temporal</label>
                <input type="text" placeholder="Si se deja vacío, será 'host123'" value={createFormData.password || ''} onChange={e => setCreateFormData({...createFormData, password: e.target.value})} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-glass)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px dashed var(--border-color)'
                }}>
                  {createFormData.organizationLogo ? (
                    <img src={createFormData.organizationLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>🏢</span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Logo de la Organización (Opcional)</label>
                  <input type="file" accept="image/*" ref={createLogoInputRef} style={{ display: 'none' }} onChange={handleCreateLogoUpload} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => createLogoInputRef.current?.click()} disabled={uploadingLogo}>
                    {uploadingLogo ? 'Subiendo...' : 'Subir Imagen'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Nombre de la Organización</label>
                <input value={createFormData.organizationName || ''} onChange={e => setCreateFormData({...createFormData, organizationName: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre Representante</label>
                  <input value={createFormData.firstName || ''} onChange={e => setCreateFormData({...createFormData, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Apellido Representante</label>
                  <input value={createFormData.lastName || ''} onChange={e => setCreateFormData({...createFormData, lastName: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={createFormData.phone || ''} onChange={e => setCreateFormData({...createFormData, phone: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Cédula/RUC</label>
                  <input value={createFormData.identificationNumber || ''} onChange={e => setCreateFormData({...createFormData, identificationNumber: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Provincia</label>
                  <input value={createFormData.province || ''} onChange={e => setCreateFormData({...createFormData, province: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input value={createFormData.city || ''} onChange={e => setCreateFormData({...createFormData, city: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={createFormData.address || ''} onChange={e => setCreateFormData({...createFormData, address: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Plan Inicial</label>
                  <select value={createFormData.plan || (plans.length > 0 ? plans[0].name : '')} onChange={e => setCreateFormData({...createFormData, plan: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }}>
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado Inicial</label>
                  <select value={createFormData.status || 'APPROVED'} onChange={e => setCreateFormData({...createFormData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }}>
                    <option value="PENDING">Pendiente</option>
                    <option value="APPROVED">Aprobado</option>
                    <option value="REJECTED">Rechazado</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Organización'}
                </button>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => setIsCreatingOrg(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Form Modal Overlay */}
      {isCreatingPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="auth-card animate-fade-in-up" style={{ maxWidth: '500px', width: '100%' }}>
            <h2>{editingPlanData ? '✏️ Editar Plan' : '💎 Crear Nuevo Plan'}</h2>
            <form onSubmit={handleSavePlan} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Nombre del Plan</label>
                <input value={planFormData.name || ''} onChange={e => setPlanFormData({...planFormData, name: e.target.value})} required placeholder="Ej: FREE, BASIC, ELITE..." />
              </div>
              <div className="form-group">
                <label>Nro Publicaciones (Usa 0 para Ilimitado)</label>
                <input type="number" min="0" value={planFormData.maxEvents !== undefined ? planFormData.maxEvents : ''} onChange={e => setPlanFormData({...planFormData, maxEvents: e.target.value})} required placeholder="Ej: 5" />
              </div>
              <div className="form-group">
                <label>Valor ($)</label>
                <input type="number" step="0.01" min="0" value={planFormData.price || ''} onChange={e => setPlanFormData({...planFormData, price: e.target.value})} required placeholder="Ej: 29.99" />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Plan'}
                </button>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => { setIsCreatingPlan(false); setEditingPlanData(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin User Form Modal Overlay */}
      {isCreatingUser && user?.role === 'ADMIN' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="auth-card animate-fade-in-up" style={{ maxWidth: '500px', width: '100%' }}>
            <h2>{editingUserData ? '✏️ Editar Usuario' : '👥 Añadir Usuario'}</h2>
            
            {formError && (
              <div style={{ 
                marginTop: '1rem', padding: '0.75rem 1rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', 
                borderRadius: '4px', color: '#fca5a5', fontSize: '0.875rem' 
              }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSaveUser} style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input value={userFormData.firstName || ''} onChange={e => setUserFormData({...userFormData, firstName: e.target.value})} required placeholder="Ej: Juan" />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input value={userFormData.lastName || ''} onChange={e => setUserFormData({...userFormData, lastName: e.target.value})} required placeholder="Ej: Pérez" />
                </div>
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" value={userFormData.email || ''} onChange={e => setUserFormData({...userFormData, email: e.target.value})} required placeholder="admin@ejemplo.com" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input value={userFormData.phone || ''} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} placeholder="0999999999" />
              </div>
              <div className="form-group">
                <label>Contraseña {editingUserData ? '(Dejar en blanco para no cambiar)' : ''}</label>
                <input type="password" placeholder={editingUserData ? "********" : "Si dejas en blanco, será 'admin123'"} value={userFormData.password || ''} onChange={e => setUserFormData({...userFormData, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Rol de Acceso</label>
                <select value={userFormData.role || 'EDITOR'} onChange={e => setUserFormData({...userFormData, role: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="EDITOR">Editor (Solo lectura y analíticas)</option>
                  <option value="ADMIN">Administrador Global (Acceso total)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Usuario'}
                </button>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => { setIsCreatingUser(false); setEditingUserData(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BannersView({ token }: { token: string }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({ imageUrl: '', linkUrl: '', title: '', isActive: true, order: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getBannersAdmin(token);
      setBanners(data);
    } catch {
      setLoadError('No se pudieron cargar los banners. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingBanner(null);
    setFormError('');
    setFormData({ imageUrl: '', linkUrl: '', title: '', isActive: true, order: banners.length });
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setFormError('');
    setFormData({ imageUrl: b.imageUrl, linkUrl: b.linkUrl || '', title: b.title || '', isActive: b.isActive, order: b.order });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setFormError(''); };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBannerImage(file, token);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch {
      setFormError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.imageUrl) { setFormError('La imagen del banner es obligatoria.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, formData, token);
        showToast('Banner actualizado correctamente.');
      } else {
        await createBanner(formData, token);
        showToast('Banner creado correctamente.');
      }
      closeForm();
      await load();
    } catch {
      setFormError('No se pudo guardar el banner. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este banner? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      await deleteBanner(id, token);
      showToast('Banner eliminado.');
      await load();
    } catch {
      showToast('No se pudo eliminar el banner.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (b: Banner) => {
    setTogglingId(b.id);
    try {
      await updateBanner(b.id, { isActive: !b.isActive }, token);
      showToast(b.isActive ? 'Banner desactivado.' : 'Banner activado.');
      await load();
    } catch {
      showToast('No se pudo actualizar el estado.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const SERVER_URL = API_URL.replace('/api', '');
  const resolveImg = (url: string) => url.startsWith('http') ? url : `${SERVER_URL}${url}`;

  const atLimit = banners.length >= 3;

  return (
    <div style={{ position: 'relative' }}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 2000,
          padding: '0.85rem 1.25rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Banners Publicitarios</h1>
          <p>Gestión de espacios publicitarios del Portal de Clientes.</p>
        </div>
        {!loading && !loadError && (
          <button
            className="btn btn-primary"
            onClick={openCreate}
            disabled={atLimit}
            title={atLimit ? 'Máximo 3 banners permitidos' : undefined}
          >
            + Agregar Banner
          </button>
        )}
      </div>

      {/* Capacity indicator */}
      {!loading && !loadError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capacidad:</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '2rem', height: '0.4rem', borderRadius: '999px',
                background: i < banners.length ? '#7c3aed' : 'rgba(139,92,246,0.2)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{banners.length} / 3 banners</span>
          {atLimit && <span style={{ fontSize: '0.75rem', color: '#a78bfa', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', padding: '0.15rem 0.6rem', borderRadius: '999px' }}>Límite alcanzado</span>}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: '100px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Load error state */}
      {!loading && loadError && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Error al cargar los banners</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '360px', margin: '0 auto 1.5rem' }}>{loadError}</p>
          <button
            onClick={load}
            style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadError && banners.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>📢</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Sin banners publicitarios</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', maxWidth: '380px', margin: '0 auto 1.75rem' }}>
            Sube hasta 3 imágenes en formato 16:3 que se mostrarán como slider en el Portal de Clientes.
          </p>
          <button
            onClick={openCreate}
            style={{ padding: '0.7rem 1.75rem', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
          >
            + Crear primer banner
          </button>
        </div>
      )}

      {/* Banner list */}
      {!loading && !loadError && banners.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {banners.map((b, idx) => (
            <div
              key={b.id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
                overflow: 'hidden', display: 'flex', alignItems: 'stretch',
                opacity: (!b.isActive) ? 0.65 : 1, transition: 'opacity 0.2s',
              }}
            >
              {/* Thumbnail (16:3 ratio) */}
              <div style={{ width: '300px', minWidth: '300px', aspectRatio: '16/3', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                <img
                  src={resolveImg(b.imageUrl)}
                  alt={b.title || `Banner ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.45rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.title || `Banner ${idx + 1}`}</span>
                  <span style={{
                    padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.03em',
                    background: b.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.15)',
                    color: b.isActive ? '#4ade80' : 'var(--text-muted)',
                    border: `1px solid ${b.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)'}`,
                  }}>
                    {b.isActive ? '● Activo' : '○ Inactivo'}
                  </span>
                </div>
                {b.linkUrl ? (
                  <div style={{ fontSize: '0.78rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden' }}>
                    <span>🔗</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.linkUrl}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin enlace de destino</div>
                )}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Posición #{b.order + 1}</div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.875rem', justifyContent: 'center', borderLeft: '1px solid var(--border)', minWidth: '120px' }}>
                <button
                  onClick={() => toggleActive(b)}
                  disabled={togglingId === b.id}
                  style={{
                    padding: '0.4rem 0.6rem', borderRadius: '7px', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer',
                    background: b.isActive ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                    color: b.isActive ? '#f87171' : '#4ade80',
                    border: `1px solid ${b.isActive ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
                    opacity: togglingId === b.id ? 0.6 : 1,
                  }}
                >
                  {togglingId === b.id ? '...' : b.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => openEdit(b)}
                  style={{ padding: '0.4rem 0.6rem', borderRadius: '7px', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  ✏ Editar
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  style={{
                    padding: '0.4rem 0.6rem', borderRadius: '7px', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer',
                    background: 'rgba(239,68,68,0.07)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)',
                    opacity: deletingId === b.id ? 0.6 : 1,
                  }}
                >
                  {deletingId === b.id ? '...' : '🗑 Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div style={{ background: 'var(--surface)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: '580px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{editingBanner ? 'Editar Banner' : 'Nuevo Banner'}</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>La imagen debe tener proporción 16:3 para mejor resultado.</p>
              </div>
              <button
                onClick={closeForm}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1, width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>

            {/* Image upload */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                Imagen del Banner <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div
                style={{
                  border: `2px dashed ${formData.imageUrl ? 'rgba(139,92,246,0.5)' : 'var(--border)'}`,
                  borderRadius: '10px', overflow: 'hidden', aspectRatio: '16/3',
                  background: 'var(--bg)', position: 'relative', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.imageUrl ? (
                  <>
                    <img src={resolveImg(formData.imageUrl)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, opacity: 0, transition: 'opacity 0.2s' }} className="img-change-hint">Cambiar imagen</span>
                    </div>
                  </>
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' }}>
                    {uploading ? (
                      <>
                        <span style={{ fontSize: '1.5rem' }}>⏳</span>
                        <span style={{ fontSize: '0.8rem' }}>Subiendo imagen...</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '2rem' }}>🖼️</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Haz clic para subir una imagen</span>
                        <span style={{ fontSize: '0.72rem' }}>Proporción recomendada: 16:3 — PNG, JPG, WEBP</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
              {formData.imageUrl && !uploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ marginTop: '0.5rem', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  Cambiar imagen
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Título <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span></label>
              <input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Evento Especial de Julio"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {/* Link URL */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Enlace de destino <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span></label>
              <input
                value={formData.linkUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="https://..."
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Al hacer clic en el banner, el usuario será redirigido a esta URL.</p>
            </div>

            {/* Order + Active */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Posición</label>
                <input
                  type="number" min={0} max={2}
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ paddingBottom: '0.15rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.65rem 1rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: '#7c3aed' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Publicar inmediatamente</span>
                </label>
              </div>
            </div>

            {/* Form error */}
            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem' }}>
                <span>⚠</span> {formError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
              <button
                onClick={closeForm}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading || !formData.imageUrl}
                style={{
                  padding: '0.65rem 1.75rem', borderRadius: '9px', border: 'none',
                  background: saving || uploading || !formData.imageUrl ? 'rgba(124,58,237,0.4)' : '#7c3aed',
                  color: '#fff', cursor: saving || uploading || !formData.imageUrl ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 700, transition: 'background 0.2s',
                }}
              >
                {saving ? 'Guardando...' : editingBanner ? 'Guardar cambios' : 'Crear Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
