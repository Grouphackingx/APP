'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-card animate-fade-in-up" style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(245,158,11,0.1)', border: '2px solid #f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 1.5rem',
          }}>📬</div>
          <h1 style={{ fontSize: '1.5rem' }}>Revisa tu correo</h1>
          <p className="auth-subtitle" style={{ marginBottom: '1rem' }}>
            Si existe una cuenta asociada a<br />
            <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>,<br />
            recibirás un enlace para restablecer tu contraseña.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            El enlace es válido por 60 minutos. Si no lo ves, revisa tu carpeta de spam.
          </p>
          <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← Volver al inicio de sesión</Link>
          </div>
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
          }}>🔑</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>¿Olvidaste tu contraseña?</h1>
          <p className="auth-subtitle" style={{ margin: 0 }}>
            Ingresa tu correo de administrador y te enviaremos un enlace de recuperación.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="admin@afroeventos.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Enviando...
              </span>
            ) : (
              'Enviar enlace de recuperación'
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
