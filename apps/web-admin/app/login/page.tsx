'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            textAlign: 'center',
            marginBottom: '0.5rem',
            fontSize: '2.5rem',
          }}
        >
          🎫
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Global Admin</h1>
        <p className="auth-subtitle mb-6 text-slate-500">Panel de Control General de la Plataforma OpenTicket</p>

        {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

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
            <label htmlFor="password">Contraseña</label>
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
      </div>
    </div>
  );
}
