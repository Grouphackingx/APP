'use client';

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import './auth.css';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) setRedirectTo(redirect);
    if (urlParams.get('expired') === '1') {
      setSessionExpired(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);

    try {
      const result = await login(email, password);
      loginUser(result.access_token, result.user);
      router.push(redirectTo);
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setUnverified(true);
      } else {
        setError(err.message || 'Credenciales inválidas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in-up">
        <h1>Bienvenido de vuelta</h1>
        <p className="auth-subtitle">Inicia sesión para comprar tus tickets</p>

        {sessionExpired && (
          <div className="alert alert-error">
            🔒 Tu sesión cerró por inactividad. Por favor inicia sesión nuevamente.
          </div>
        )}

        {error && (
          <div className="alert alert-error" id="login-error">
            ⚠️ {error}
          </div>
        )}

        {unverified && (
          <div className="alert" style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem',
          }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#f59e0b' }}>
              📧 Correo no verificado
            </p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo enlace.
            </p>
            <Link
              href={`/verify-email?resend=1&email=${encodeURIComponent(email)}`}
              style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 600 }}
            >
              Reenviar correo de verificación →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="password" style={{ margin: 0 }}>Contraseña</label>
              <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
            id="login-submit"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span
                  className="spinner"
                  style={{ width: 18, height: 18, borderWidth: 2 }}
                />
                Ingresando...
              </span>
            ) : (
              '🔐 Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="auth-link">
          ¿No tienes cuenta? <Link href={redirectTo !== '/' ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register'}>Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
