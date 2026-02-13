'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" id="navbar-logo">
          <span className="logo-icon">🎫</span>
          OpenTicket
        </Link>

        <div className="navbar-links">
          <Link href="/" id="nav-home">
            Eventos
          </Link>

          {isLoading ? null : user ? (
            <>
              <span
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-accent)',
                  background: 'var(--bg-glass-light)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                }}
              >
                👋 {user.name}
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                id="logout-btn"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" id="nav-login">
                <span className="btn btn-secondary btn-sm">Iniciar Sesión</span>
              </Link>
              <Link href="/register" id="nav-register">
                <span className="btn btn-primary btn-sm">Registrarse</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
