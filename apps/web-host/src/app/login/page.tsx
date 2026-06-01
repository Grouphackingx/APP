'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { AfroEventosLogo } from '../../components/AfroEventosLogo';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('expired') === '1') {
      setSessionExpired(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      loginUser(result.access_token, result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in-up">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <a href={process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4200'} rel="noopener noreferrer">
            <AfroEventosLogo variant="light" height={68} />
          </a>
        </div>
        <h1>Organizador</h1>

        {sessionExpired && (
          <div className="alert alert-error">
            🔒 Tu sesión cerró por inactividad. Por favor inicia sesión nuevamente.
          </div>
        )}
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="password" style={{ margin: 0 }}>Contraseña</label>
              <a href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : '🔐 Iniciar Sesión'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '14px' }}>
            ¿Eres un organizador nuevo? <a href="/register" style={{ fontWeight: 600, color: '#6AC44D', textDecoration: 'none' }}>Crea tu cuenta aquí</a>
        </div>
      </div>
    </div>
  );
}
