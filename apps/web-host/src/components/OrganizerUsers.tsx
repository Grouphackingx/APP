'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getOrganizerMembers, createOrganizerMember, updateOrganizerMember,
  deleteOrganizerMember, uploadMemberAvatar, OrganizerMember,
} from '../lib/api';
import { useConfirm, useToast } from './UIHelpers';

interface Props { token: string }

const ROLE_LABEL: Record<string, string> = { ADMIN: 'Administrador', STAFF: 'Staff' };
const ROLE_COLOR: Record<string, string> = { ADMIN: '#6AC44D', STAFF: '#22D3EE' };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
}

const emptyForm = {
  name: '', email: '', phone: '', password: '',
  memberRole: 'STAFF' as 'ADMIN' | 'STAFF', avatarUrl: '',
};

export function OrganizerUsers({ token }: Props) {
  const { showConfirm, modalNode } = useConfirm();
  const { showToast, toastNode } = useToast();
  const [members, setMembers]     = useState<OrganizerMember[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<OrganizerMember | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try { setMembers(await getOrganizerMembers(token)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setAvatarPreview(null);
    setAvatarFile(null);
    setError('');
    setShowPass(false);
    setShowModal(true);
  }

  function openEdit(m: OrganizerMember) {
    setEditing(m);
    setForm({ name: m.name, email: m.email, phone: m.phone ?? '', password: '', memberRole: m.memberRole, avatarUrl: m.avatarUrl ?? '' });
    setAvatarPreview(m.avatarUrl ?? null);
    setAvatarFile(null);
    setError('');
    setShowPass(false);
    setShowModal(true);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let avatarUrl = form.avatarUrl;

      if (editing) {
        // Upload avatar first if a new file was selected
        if (avatarFile) {
          setUploading(true);
          avatarUrl = await uploadMemberAvatar(avatarFile, editing.id, token);
          setUploading(false);
        }
        await updateOrganizerMember(editing.id, {
          name: form.name,
          phone: form.phone,
          avatarUrl,
          memberRole: form.memberRole,
          ...(form.password ? { password: form.password } : {}),
        }, token);
      } else {
        if (!form.password) { setError('La contraseña es obligatoria'); setSaving(false); return; }
        // Create first to get the ID, then upload avatar if provided
        const created = await createOrganizerMember({
          name: form.name, email: form.email, phone: form.phone,
          password: form.password, memberRole: form.memberRole,
        }, token);

        if (avatarFile) {
          setUploading(true);
          avatarUrl = await uploadMemberAvatar(avatarFile, created.id, token);
          setUploading(false);
          // Persist avatarUrl now that we have the real member ID
          await updateOrganizerMember(created.id, { avatarUrl }, token);
        }
      }

      setShowModal(false);
      fetchMembers();
    } catch (err: unknown) {
      setUploading(false);
      setError((err as { message?: string })?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(m: OrganizerMember) {
    showConfirm(
      'Eliminar usuario',
      `¿Eliminar a "${m.name}"? Esta acción no se puede deshacer.`,
      async () => {
        try { await deleteOrganizerMember(m.id, token); fetchMembers(); }
        catch (err: unknown) { showToast((err as { message?: string })?.message || 'Error al eliminar.', 'error'); }
      },
      'danger'
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem',
    fontSize: '0.85rem', color: 'var(--text-secondary)',
  };

  return (
    <div className="table-container">
      {/* Header */}
      <div className="table-header">
        <div>
          <h2>👤 Equipo de Acceso</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Usuarios adicionales que pueden acceder a este panel
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>➕ Agregar Usuario</button>
      </div>

      {/* Leyenda de roles */}
      <div style={{ padding: '0 1.5rem 1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <span><span style={{ color: '#6AC44D', fontWeight: 700 }}>● Administrador</span> — acceso completo al panel</span>
        <span><span style={{ color: '#22D3EE', fontWeight: 700 }}>● Staff</span> — solo Escáner de Tickets</span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3>Sin usuarios adicionales</h3>
          <p>Agrega miembros de tu equipo para que puedan acceder al panel.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}>➕ Agregar Usuario</button>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--bg-secondary)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '0.9rem', fontWeight: 700,
                      color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                    }}>
                      {m.avatarUrl
                        ? <img src={m.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : m.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {m.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td>
                  <span style={{
                    display: 'inline-block', padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
                    color: ROLE_COLOR[m.memberRole],
                    background: `${ROLE_COLOR[m.memberRole]}18`,
                    border: `1px solid ${ROLE_COLOR[m.memberRole]}40`,
                  }}>
                    {ROLE_LABEL[m.memberRole]}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{formatDate(m.createdAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)} title="Editar">✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m)} title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            padding: '2rem', width: '100%', maxWidth: 460,
            border: '1px solid var(--border-color)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              {editing ? '✏️ Editar Usuario' : '➕ Agregar Usuario'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)',
                    overflow: 'hidden', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '2rem', cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar foto"
                >
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: 'var(--text-muted)' }}>📷</span>}
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: '0.2s',
                    borderRadius: '50%',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                  >
                    <span style={{ color: '#fff', fontSize: '1rem' }}>✏️</span>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                  onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? 'Cambiar foto' : 'Subir foto'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle} />
              </div>

              {/* Email — solo al crear */}
              {!editing && (
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={inputStyle} />
                </div>
              )}

              {/* Teléfono */}
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+593 99 999 9999"
                  style={inputStyle} />
              </div>

              {/* Contraseña */}
              <div>
                <label style={labelStyle}>
                  {editing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: '2.75rem' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Rol */}
              <div>
                <label style={labelStyle}>Rol</label>
                <select value={form.memberRole}
                  onChange={(e) => setForm({ ...form, memberRole: e.target.value as 'ADMIN' | 'STAFF' })}
                  style={inputStyle}>
                  <option value="ADMIN">Administrador — acceso completo</option>
                  <option value="STAFF">Staff — solo Escáner de Tickets</option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </p>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving || uploading}>
                  {uploading ? '⏳ Subiendo foto...' : saving ? '⏳ Guardando...' : editing ? '💾 Guardar cambios' : '➕ Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalNode}
      {toastNode}
    </div>
  );
}
