'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import { getProfile, updateProfile, uploadUserAvatar, UpdateProfileData } from '../../lib/api';
import './my-profile.css';

// ── Ecuador provinces & cities ──────────────────────────────────────────────
const ECUADOR_LOCATIONS: Record<string, string[]> = {
  Azuay: ['Cuenca', 'Gualaceo', 'Paute', 'Sigsig', 'Chordeleg', 'El Pan', 'Guachapala', 'Nabón', 'Oña', 'Pucará', 'San Fernando', 'Santa Isabel', 'Sevilla de Oro'],
  Bolívar: ['Guaranda', 'San Miguel', 'Chillanes', 'Chimbo', 'Echeandía', 'Las Naves'],
  Cañar: ['Azogues', 'Biblián', 'Cañar', 'Déleg', 'El Tambo', 'La Troncal', 'Suscal'],
  Carchi: ['Tulcán', 'Bolívar', 'Espejo', 'Mira', 'Montúfar', 'San Pedro de Huaca'],
  Chimborazo: ['Riobamba', 'Alausí', 'Chambo', 'Chunchi', 'Colta', 'Cumandá', 'Guamote', 'Guano', 'Pallatanga', 'Penipe'],
  Cotopaxi: ['Latacunga', 'La Maná', 'Pangua', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos'],
  'El Oro': ['Machala', 'Arenillas', 'Atahualpa', 'Balsas', 'Chilla', 'El Guabo', 'Huaquillas', 'Marcabelí', 'Pasaje', 'Piñas', 'Portovelo', 'Santa Rosa', 'Zaruma', 'Las Lajas'],
  Esmeraldas: ['Esmeraldas', 'Atacames', 'Eloy Alfaro', 'Muisne', 'Quinindé', 'Río Verde', 'San Lorenzo'],
  Galápagos: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'],
  Guayas: ['Guayaquil', 'Alfredo Baquerizo Moreno', 'Balao', 'Balzar', 'Colimes', 'Daule', 'Durán', 'El Empalme', 'El Triunfo', 'Lomas de Sargentillo', 'Milagro', 'Naranjal', 'Naranjito', 'Nobol', 'Palestina', 'Pedro Carbo', 'Playas', 'Samborondón', 'Santa Lucía', 'Simón Bolívar', 'Yaguachi'],
  Imbabura: ['Ibarra', 'Antonio Ante', 'Cotacachi', 'Otavalo', 'Pimampiro', 'San Miguel de Urcuquí'],
  Loja: ['Loja', 'Calvas', 'Catamayo', 'Célica', 'Chaguarpamba', 'Espíndola', 'Gonzanamá', 'Macará', 'Olmedo', 'Paltas', 'Pindal', 'Puyango', 'Quilanga', 'Saraguro', 'Sozoranga', 'Zapotillo'],
  'Los Ríos': ['Babahoyo', 'Baba', 'Buena Fe', 'Mocache', 'Montalvo', 'Palenque', 'Puebloviejo', 'Quevedo', 'Urdaneta', 'Valencia', 'Ventanas', 'Vinces'],
  Manabí: ['Portoviejo', 'Bolívar', 'Chone', 'El Carmen', 'Flavio Alfaro', 'Jipijapa', 'Junín', 'Manta', 'Montecristi', 'Olmedo', 'Paján', 'Pedernales', 'Pichincha', 'Puerto López', 'Rocafuerte', 'San Vicente', 'Santa Ana', 'Sucre', 'Tosagua', '24 de Mayo'],
  'Morona Santiago': ['Macas', 'Gualaquiza', 'Huamboya', 'Limón Indanza', 'Logroño', 'Pablo Sexto', 'Palora', 'San Juan Bosco', 'Santiago', 'Sucúa', 'Taisha', 'Tiwintza'],
  Napo: ['Tena', 'Archidona', 'El Chaco', 'Quijos', 'Carlos Julio Arosemena Tola'],
  Orellana: ['Puerto Francisco de Orellana', 'Aguarico', 'La Joya de los Sachas', 'Loreto'],
  Pastaza: ['Puyo', 'Arajuno', 'Mera', 'Santa Clara'],
  Pichincha: ['Quito', 'Cayambe', 'Mejía', 'Pedro Moncayo', 'Pedro Vicente Maldonado', 'Puerto Quito', 'Rumiñahui', 'San Miguel de los Bancos'],
  'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'],
  'Santo Domingo de los Tsáchilas': ['Santo Domingo', 'La Concordia'],
  Sucumbíos: ['Nueva Loja', 'Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Shushufindi', 'Sucumbíos'],
  Tungurahua: ['Ambato', 'Baños de Agua Santa', 'Cevallos', 'Mocha', 'Patate', 'Quero', 'San Pedro de Pelileo', 'Santiago de Píllaro', 'Tisaleo'],
  'Zamora Chinchipe': ['Zamora', 'Chinchipe', 'El Pangui', 'Nangaritza', 'Palanda', 'Paquisha', 'Yacuambi', 'Yantzaza'],
};

const PROVINCES = Object.keys(ECUADOR_LOCATIONS).sort();

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

// ── Component ────────────────────────────────────────────────────────────────
export default function MyProfilePage() {
  const { user, token, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    idType: '', idNumber: '', address: '',
    province: '', city: '', birthDate: '', citizenship: '',
  });

  useEffect(() => {
    if (isLoading) return;
    if (!user || !token) { router.push('/login?redirect=/my-profile'); return; }

    getProfile(token).then((profile) => {
      setForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        password: '',
        idType: profile.idType ?? '',
        idNumber: profile.idNumber ?? '',
        address: profile.address ?? '',
        province: profile.province ?? '',
        city: profile.city ?? '',
        birthDate: toDateInput(profile.birthDate),
        citizenship: profile.citizenship ?? '',
      });
      if (profile.avatarUrl) setAvatarPreview(profile.avatarUrl);
    }).catch(() => {
      setAlert({ type: 'error', msg: 'No se pudo cargar el perfil. Intenta de nuevo.' });
    });
  }, [isLoading, user, token, router]);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !token) return;

    // Immediate local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploadingAvatar(true);
    setAlert(null);

    try {
      const { url } = await uploadUserAvatar(file, user.id, token);
      // Persist URL in profile
      await updateProfile({ avatarUrl: url }, token);
      setAvatarPreview(url);
      updateUser({ ...user, avatarUrl: url });
      setAlert({ type: 'success', msg: 'Foto de perfil actualizada.' });
    } catch (err: unknown) {
      setAvatarPreview(user.avatarUrl ?? null);
      const msg = err instanceof Error ? err.message : 'Error al subir la imagen.';
      setAlert({ type: 'error', msg });
    } finally {
      setUploadingAvatar(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Form ───────────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'province') return { ...prev, province: value, city: '' };
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setAlert(null);

    const payload: UpdateProfileData = {};
    if (form.name)        payload.name        = form.name;
    if (form.email)       payload.email       = form.email;
    if (form.phone)       payload.phone       = form.phone;
    if (form.password)    payload.password    = form.password;
    if (form.idType)      payload.idType      = form.idType;
    if (form.idNumber)    payload.idNumber    = form.idNumber;
    if (form.address)     payload.address     = form.address;
    if (form.province)    payload.province    = form.province;
    if (form.city)        payload.city        = form.city;
    if (form.birthDate)   payload.birthDate   = form.birthDate;
    if (form.citizenship) payload.citizenship = form.citizenship;

    try {
      const updated = await updateProfile(payload, token);
      updateUser({ ...updated, birthDate: updated.birthDate ?? null });
      setForm((prev) => ({ ...prev, password: '' }));
      setAlert({ type: 'success', msg: '¡Perfil actualizado exitosamente!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios.';
      setAlert({ type: 'error', msg });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return null;

  const cities = form.province ? (ECUADOR_LOCATIONS[form.province] ?? []) : [];

  return (
    <div className="profile-page">

      {/* ── Header with avatar ── */}
      <div className="profile-header">
        <div className={`profile-avatar-wrapper${uploadingAvatar ? ' avatar-uploading' : ''}`}>
          <div className="profile-avatar">
            {avatarPreview
              ? <img src={avatarPreview} alt="Foto de perfil" />
              : <span>👤</span>
            }
          </div>
          {uploadingAvatar && (
            <div className="avatar-uploading-label">Subiendo…</div>
          )}
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
            disabled={uploadingAvatar}
          />
          {/* Edit button over avatar */}
          <button
            type="button"
            className="avatar-edit-btn"
            title="Cambiar foto de perfil"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
          >
            ✏️
          </button>
        </div>

        <div className="profile-header-info">
          <h1>{user?.name ?? 'Mi Perfil'}</h1>
          <p>{user?.email}</p>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
          >
            {uploadingAvatar ? 'Subiendo imagen…' : 'Haz clic en el avatar para cambiar tu foto'}
          </span>
        </div>
      </div>

      {alert && (
        <div className={`profile-alert ${alert.type}`}>
          {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Datos de acceso ── */}
        <div className="profile-section">
          <div className="profile-section-title">Datos de acceso</div>
          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="name">Nombre completo</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Tu nombre" />
            </div>
            <div className="profile-field">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
            </div>
            <div className="profile-field">
              <label htmlFor="phone">Teléfono</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+593 99 999 9999" />
            </div>
            <div className="profile-field">
              <label htmlFor="password">Nueva contraseña</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Dejar vacío para no cambiar"
                  minLength={6}
                  autoComplete="new-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <span className="field-hint">Mínimo 6 caracteres</span>
            </div>
          </div>
        </div>

        {/* ── Identificación ── */}
        <div className="profile-section">
          <div className="profile-section-title">Identificación</div>
          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="idType">Tipo de documento</label>
              <select id="idType" name="idType" value={form.idType} onChange={handleChange}>
                <option value="">— Seleccionar —</option>
                <option value="cedula">Cédula de identidad</option>
                <option value="ruc">RUC</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="profile-field">
              <label htmlFor="idNumber">Número de documento</label>
              <input id="idNumber" name="idNumber" type="text" value={form.idNumber} onChange={handleChange} placeholder="Ej: 1712345678" />
            </div>
            <div className="profile-field">
              <label htmlFor="birthDate">Fecha de nacimiento</label>
              <input id="birthDate" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
            </div>
            <div className="profile-field">
              <label htmlFor="citizenship">Ciudadanía / Nacionalidad</label>
              <input id="citizenship" name="citizenship" type="text" value={form.citizenship} onChange={handleChange} placeholder="Ej: Ecuatoriana" />
            </div>
          </div>
        </div>

        {/* ── Dirección ── */}
        <div className="profile-section">
          <div className="profile-section-title">Dirección</div>
          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="province">Provincia</label>
              <select id="province" name="province" value={form.province} onChange={handleChange}>
                <option value="">— Seleccionar provincia —</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="profile-field">
              <label htmlFor="city">Ciudad / Cantón</label>
              <select id="city" name="city" value={form.city} onChange={handleChange} disabled={!form.province}>
                <option value="">— Seleccionar ciudad —</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="profile-field span-2">
              <label htmlFor="address">Dirección completa</label>
              <input id="address" name="address" type="text" value={form.address} onChange={handleChange} placeholder="Calle, número, barrio..." />
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="profile-actions">
          <Link href="/" className="btn btn-secondary btn-sm">← Explorar Eventos</Link>
          <button type="submit" className="btn btn-primary" disabled={saving || uploadingAvatar}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>

      </form>
    </div>
  );
}
