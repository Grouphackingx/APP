'use client';
import { useAuth } from '../lib/AuthContext';

export function ImpersonationBanner() {
  const { isImpersonating, user, logout } = useAuth();
  if (!isImpersonating) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      backgroundColor: '#4f46e5', color: '#fff',
      padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 500,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    }}>
      <span>
        👁 <strong>Modo Vista Admin</strong> — Navegando como{' '}
        <strong>{user?.name || user?.email}</strong>. Sesión expira en 1 hora.
      </span>
      <button
        onClick={logout}
        style={{
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          color: '#fff', padding: '0.3rem 0.9rem', borderRadius: '6px',
          cursor: 'pointer', fontWeight: 600,
        }}
      >
        Salir
      </button>
    </div>
  );
}
