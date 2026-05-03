'use client';

import { useEffect, useState, useRef } from 'react';
import { getOrganizers, setOrganizerStatus, deleteOrganizer, updateOrganizer, createOrganizer, getPlans, createPlan, updatePlan, deletePlan, getOrganizersAnalytics, getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, uploadImage } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';

export default function AdminDashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'inicio' | 'dashboard' | 'users' | 'plans' | 'analytics'>('inicio');
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
    }
  }, [token, user]);

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
                <p>Bienvenido al Sistema Central de OpenTicket. Aquí fluye el estado de toda la red.</p>
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
