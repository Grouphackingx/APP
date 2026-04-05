'use client';

import { useEffect, useState } from 'react';
import { getOrganizers, setOrganizerStatus, deleteOrganizer, updateOrganizer } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'inicio' | 'dashboard' | 'users'>('inicio');
  const [editingOrgData, setEditingOrgData] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    if (!token) return;
    loadOrganizers();
  }, [token]);

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

  const handleDeleteOrg = async (id: string, name: string) => {
    if (!confirm(`¿Estás completamente seguro de borrar de forma permanente a ${name}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteOrganizer(id, token as string);
      loadOrganizers();
    } catch (err) {
      alert('No se pudo borrar el organizador o posee eventos asociados.');
    }
  };

  if (!user || user.role !== 'ADMIN') return null;

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
                                fontWeight: 'bold', color: '#a855f7'
                              }}>
                                {prof.organizationName ? prof.organizationName.charAt(0).toUpperCase() : '?'}
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

        {view === 'users' && (
          <>
            <div className="page-header">
              <div>
                <h1>Gestión de Usuarios</h1>
                <p>Directorio de cuentas de usuarios compradores en toda la plataforma OpenTicket.</p>
              </div>
            </div>
            
            <div className="table-container">
              <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                <h2>👥 Base de Datos de Usuarios</h2>
              </div>
              <div className="empty-state">
                <div className="empty-icon">🧑‍💻</div>
                <h3>Módulo en desarrollo</h3>
                <p>Pronto podrás visualizar aquí a todos los consumidores registrados, verificar compras, y gestionar roles.</p>
              </div>
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
                  <select value={editFormData.plan || 'FREE'} onChange={e => setEditFormData({...editFormData, plan: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }}>
                    <option value="FREE">FREE</option>
                    <option value="PLUS">PLUS</option>
                    <option value="ELITE">ELITE</option>
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
    </div>
  );
}
