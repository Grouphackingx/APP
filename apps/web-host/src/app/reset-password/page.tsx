'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '../../lib/api';

export default function ResetPasswordPageWrapper() {
  return <Suspense><ResetPasswordPage /></Suspense>;
}

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('El enlace de recuperación no es válido.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'El enlace no es válido o ha expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card animate-fade-in-up" style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(106,196,77,0.1)', border: '2px solid var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 1.5rem',
          }}>✅</div>
          <h1 style={{ fontSize: '1.5rem' }}>¡Contraseña actualizada!</h1>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            Tu contraseña fue cambiada exitosamente.<br />
            Serás redirigido al inicio de sesión en un momento.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg btn-full" style={{ display: 'block', textAlign: 'center' }}>
            Iniciar sesión →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(245,158,11,0.1)', border: '2px solid #f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 1.25rem',
          }}>🔐</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Nueva contraseña</h1>
          <p className="auth-subtitle" style={{ margin: 0 }}>
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            ⚠️ {error}
            {!token && (
              <div style={{ marginTop: '0.5rem' }}>
                <Link href="/forgot-password" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  Solicitar nuevo enlace →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="password" style={{ margin: 0 }}>Nueva contraseña</label>
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}
              >
                {showPw ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoFocus
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              type={showPw ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading || !token}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Guardando...
              </span>
            ) : (
              'Guardar nueva contraseña'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}
