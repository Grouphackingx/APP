'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import {
  getMyOrganizerProfile, updateMyBasicInfo, changeMyPassword,
  updateMyOrganizerProfileInfo, uploadImage, uploadMemberAvatar,
} from '../lib/api';

interface Props { token: string }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
};
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.4rem',
  fontSize: '0.85rem', color: 'var(--text-secondary)',
};
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-lg)', padding: '1.75rem',
  marginBottom: '1.5rem',
};
const sectionTitle: React.CSSProperties = {
  fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem',
  paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)',
};

function SaveMsg({ ok, err }: { ok: boolean; err: string }) {
  if (err) return (
    <p style={{ color: '#ef4444', fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)', marginTop: '0.5rem' }}>{err}</p>
  );
  if (ok) return (
    <p style={{ color: '#6AC44D', fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'rgba(106,196,77,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(106,196,77,0.2)', marginTop: '0.5rem' }}>✓ Guardado correctamente</p>
  );
  return null;
}

export function OrganizerProfile({ token }: Props) {
  const { user, updateUser } = useAuth();
  const isMember = user?.isMember ?? false;

  // ── Profile data loaded from API ──
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Basic info section ──
  const [basicForm, setBasicForm] = useState({ name: '', email: '', phone: '' });
  const [savingBasic, setSavingBasic] = useState(false);
  const [basicOk, setBasicOk] = useState(false);
  const [basicErr, setBasicErr] = useState('');

  // ── Avatar / logo section ──
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  // ── Org profile section (HOST only) ──
  const [orgForm, setOrgForm] = useState({
    organizationName: '', organizationDescription: '',
    address: '', province: '', city: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgOk, setOrgOk] = useState(false);
  const [orgErr, setOrgErr] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);

  // ── Password section ──
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwOk, setPwOk] = useState(false);
  const [pwErr, setPwErr] = useState('');

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const data = await getMyOrganizerProfile(token);
      setProfileData(data);
      if (data.type === 'member') {
        const m = data.member;
        setBasicForm({ name: m.name ?? '', email: m.email ?? '', phone: m.phone ?? '' });
        setAvatarPreview(m.avatarUrl ?? null);
      } else {
        const u = data.user;
        setBasicForm({ name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '' });
        const op = u.organizerProfile;
        if (op) {
          setOrgForm({
            organizationName: op.organizationName ?? '',
            organizationDescription: op.organizationDescription ?? '',
            address: op.address ?? '',
            province: op.province ?? '',
            city: op.city ?? '',
          });
          setLogoPreview(op.organizationLogo ?? null);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingProfile(false);
    }
  }, [token]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Save basic info ──
  async function saveBasic(e: React.FormEvent) {
    e.preventDefault();
    setBasicErr(''); setBasicOk(false); setSavingBasic(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        setUploadingAvatar(true);
        if (isMember && user?.id) {
          avatarUrl = await uploadMemberAvatar(avatarFile, user.id, token);
        } else {
          avatarUrl = await uploadImage(avatarFile, token, 'user-avatar');
        }
        setUploadingAvatar(false);
        setAvatarFile(null);
      }
      const payload: any = {
        name: basicForm.name,
        phone: basicForm.phone,
        ...(!isMember && { email: basicForm.email }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      };
      await updateMyBasicInfo(payload, token);
      updateUser({
        name: basicForm.name,
        email: isMember ? user?.email : basicForm.email,
      });
      setBasicOk(true);
      setTimeout(() => setBasicOk(false), 3000);
    } catch (err: any) {
      setUploadingAvatar(false);
      setBasicErr(err?.message || 'Error al guardar');
    } finally {
      setSavingBasic(false);
    }
  }

  // ── Save org profile ──
  async function saveOrg(e: React.FormEvent) {
    e.preventDefault();
    setOrgErr(''); setOrgOk(false); setSavingOrg(true);
    try {
      let organizationLogo: string | undefined;
      if (logoFile) {
        organizationLogo = await uploadImage(logoFile, token, 'logo');
        setLogoFile(null);
        setLogoPreview(organizationLogo);
      }
      const updated = await updateMyOrganizerProfileInfo(
        { ...orgForm, ...(organizationLogo !== undefined && { organizationLogo }) },
        token,
      );
      updateUser({
        organizerProfile: {
          status: user?.organizerProfile?.status ?? 'APPROVED',
          organizationLogo: updated.organizationLogo ?? user?.organizerProfile?.organizationLogo,
          id: user?.organizerProfile?.id,
        },
      });
      setOrgOk(true);
      setTimeout(() => setOrgOk(false), 3000);
    } catch (err: any) {
      setOrgErr(err?.message || 'Error al guardar');
    } finally {
      setSavingOrg(false);
    }
  }

  // ── Change password ──
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(''); setPwOk(false);
    if (pwForm.newPw !== pwForm.confirm) { setPwErr('Las contraseñas no coinciden'); return; }
    if (pwForm.newPw.length < 6) { setPwErr('La contraseña debe tener al menos 6 caracteres'); return; }
    setSavingPw(true);
    try {
      await changeMyPassword(pwForm.current, pwForm.newPw, token);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwOk(true);
      setTimeout(() => setPwOk(false), 3000);
    } catch (err: any) {
      setPwErr(err?.message || 'Error al cambiar contraseña');
    } finally {
      setSavingPw(false);
    }
  }

  function PwField({ label, field }: { label: string; field: 'current' | 'newPw' | 'confirm' }) {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPw[field] ? 'text' : 'password'}
            required
            value={pwForm[field]}
            onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })}
            style={{ ...inputStyle, paddingRight: '2.75rem' }}
          />
          <button type="button" onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            {showPw[field] ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const currentAvatar = avatarPreview;
  const displayName = basicForm.name || user?.name || '';

  return (
    <div style={{ maxWidth: 680 }}>

      {/* ── Información personal / de cuenta ── */}
      <div style={cardStyle}>
        <p style={sectionTitle}>{isMember ? '👤 Información Personal' : '👤 Información de la Cuenta'}</p>

        {/* Avatar / foto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)',
              overflow: 'hidden', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.75rem', cursor: 'pointer',
              flexShrink: 0, position: 'relative',
            }}
            onClick={() => avatarRef.current?.click()}
            title="Cambiar foto"
          >
            {currentAvatar
              ? <img src={currentAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '1.5rem' }}>{displayName.charAt(0).toUpperCase()}</span>}
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: '0.2s', borderRadius: '50%',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
            >
              <span style={{ color: '#fff', fontSize: '1rem' }}>✏️</span>
            </div>
          </div>
          <div>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              onClick={() => avatarRef.current?.click()}>
              {currentAvatar ? 'Cambiar foto' : 'Subir foto'}
            </button>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>JPG, PNG o WebP. Recomendado: 200×200 px</p>
          </div>
          <input ref={avatarRef} type="file" accept={process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'} style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5') * 1024 * 1024) { setBasicErr(`La imagen no debe superar ${process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'} MB.`); e.target.value = ''; return; }
              setAvatarFile(f);
              setAvatarPreview(URL.createObjectURL(f));
            }} />
        </div>

        <form onSubmit={saveBasic} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input required style={inputStyle} value={basicForm.name}
                onChange={e => setBasicForm({ ...basicForm, name: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input type="tel" style={inputStyle} value={basicForm.phone} placeholder="+593 99 999 9999"
                onChange={e => setBasicForm({ ...basicForm, phone: e.target.value })} />
            </div>
          </div>
          {!isMember && (
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" required style={inputStyle} value={basicForm.email}
                onChange={e => setBasicForm({ ...basicForm, email: e.target.value })} />
            </div>
          )}
          {isMember && (
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={basicForm.email} />
            </div>
          )}
          <SaveMsg ok={basicOk} err={basicErr} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingBasic || uploadingAvatar}>
              {uploadingAvatar ? '⏳ Subiendo foto...' : savingBasic ? '⏳ Guardando...' : '💾 Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Información de la organización (HOST only) ── */}
      {!isMember && (
        <div style={cardStyle}>
          <p style={sectionTitle}>🏢 Información de la Organización</p>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)',
                overflow: 'hidden', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.75rem', cursor: 'pointer',
                flexShrink: 0, position: 'relative',
              }}
              onClick={() => logoRef.current?.click()}
              title="Cambiar logo"
            >
              {logoPreview
                ? <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>🏢</span>}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: '0.2s', borderRadius: 'var(--radius-md)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
              >
                <span style={{ color: '#fff', fontSize: '1rem' }}>✏️</span>
              </div>
            </div>
            <div>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                onClick={() => logoRef.current?.click()}>
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
              </button>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Aparecerá en el sidebar del panel</p>
            </div>
            <input ref={logoRef} type="file" accept={process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'} style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5') * 1024 * 1024) { setOrgErr(`La imagen no debe superar ${process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'} MB.`); e.target.value = ''; return; }
                setLogoFile(f);
                setLogoPreview(URL.createObjectURL(f));
              }} />
          </div>

          <form onSubmit={saveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nombre de la organización</label>
              <input required style={inputStyle} value={orgForm.organizationName}
                onChange={e => setOrgForm({ ...orgForm, organizationName: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={orgForm.organizationDescription}
                onChange={e => setOrgForm({ ...orgForm, organizationDescription: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Dirección</label>
              <input style={inputStyle} value={orgForm.address}
                onChange={e => setOrgForm({ ...orgForm, address: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Provincia</label>
                <input style={inputStyle} value={orgForm.province}
                  onChange={e => setOrgForm({ ...orgForm, province: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Ciudad</label>
                <input style={inputStyle} value={orgForm.city}
                  onChange={e => setOrgForm({ ...orgForm, city: e.target.value })} />
              </div>
            </div>
            <SaveMsg ok={orgOk} err={orgErr} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={savingOrg}>
                {savingOrg ? '⏳ Guardando...' : '💾 Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Seguridad / cambiar contraseña ── */}
      <div style={cardStyle}>
        <p style={sectionTitle}>🔒 Cambiar Contraseña</p>
        <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PwField label="Contraseña actual" field="current" />
          <PwField label="Nueva contraseña" field="newPw" />
          <PwField label="Confirmar nueva contraseña" field="confirm" />
          <SaveMsg ok={pwOk} err={pwErr} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPw}>
              {savingPw ? '⏳ Cambiando...' : '🔑 Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
