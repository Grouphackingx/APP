'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail, resendVerification } from '../../lib/api';
import '../login/auth.css';

type State = 'loading' | 'success' | 'error' | 'resend';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const resendParam = searchParams.get('resend');
  const emailParam = searchParams.get('email');

  const [state, setState] = useState<State>(token ? 'loading' : 'resend');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const didVerify = useRef(false);

  useEffect(() => {
    if (!token || didVerify.current) return;
    didVerify.current = true;

    verifyEmail(token)
      .then((res) => {
        setMessage(res.message);
        setState('success');
      })
      .catch((err) => {
        setMessage(err.message || 'El enlace no es válido o ya fue usado.');
        setState('error');
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);
    try {
      await resendVerification(email);
      setResendSent(true);
    } catch {
      setResendSent(true); // always show success to avoid enumeration
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in-up" style={{ textAlign: 'center' }}>

        {state === 'loading' && (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(106,196,77,0.1)', border: '2px solid var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 1.5rem',
            }}>
              <span className="spinner" style={{ width: 24, height: 24, borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem' }}>Verificando tu correo...</h1>
            <p className="auth-subtitle">Un momento por favor.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(106,196,77,0.1)', border: '2px solid var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 1.5rem',
            }}>✅</div>
            <h1 style={{ fontSize: '1.6rem' }}>¡Correo verificado!</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.75rem' }}>
              Tu cuenta está activa. Ya puedes iniciar sesión y descubrir eventos increíbles.
            </p>
            <Link href="/login" className="btn btn-primary btn-full" style={{ display: 'block', textAlign: 'center' }}>
              Iniciar sesión →
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 1.5rem',
            }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem' }}>Enlace no válido</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>{message}</p>
            <button
              onClick={() => setState('resend')}
              className="btn btn-secondary btn-full"
              style={{ marginBottom: '0.75rem' }}
            >
              Solicitar nuevo enlace
            </button>
            <div className="auth-link"><Link href="/login">← Volver al inicio de sesión</Link></div>
          </>
        )}

        {state === 'resend' && !resendSent && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(245,158,11,0.1)', border: '2px solid #f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 1.5rem',
            }}>✉️</div>
            <h1 style={{ fontSize: '1.5rem' }}>Reenviar verificación</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              Ingresa tu correo y te enviaremos un nuevo enlace de verificación.
            </p>
            <form onSubmit={handleResend} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
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
              <button
                type="submit"
                disabled={resendLoading}
                className="btn btn-primary btn-full"
              >
                {resendLoading ? 'Enviando...' : 'Enviar nuevo enlace'}
              </button>
            </form>
            <div className="auth-link" style={{ marginTop: '1rem' }}>
              <Link href="/login">← Volver al inicio de sesión</Link>
            </div>
          </>
        )}

        {state === 'resend' && resendSent && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(106,196,77,0.1)', border: '2px solid var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 1.5rem',
            }}>📬</div>
            <h1 style={{ fontSize: '1.5rem' }}>¡Correo enviado!</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              Si existe una cuenta con ese correo pendiente de verificación, recibirás un nuevo enlace en breve.
            </p>
            <div className="auth-link"><Link href="/login">← Volver al inicio de sesión</Link></div>
          </>
        )}

      </div>
    </div>
  );
}
