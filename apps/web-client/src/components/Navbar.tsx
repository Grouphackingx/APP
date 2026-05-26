'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import SearchBar from './SearchBar';
import { AfroEventosLogo } from './AfroEventosLogo';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" id="navbar-logo">
          <AfroEventosLogo variant="light" height={52} />
        </Link>

        <div className="navbar-links">
          <SearchBar />

          {isLoading ? null : user ? (
            <>
              <Link href="/my-tickets" id="nav-my-tickets">
                <span className="btn btn-accent btn-sm">🎫 Mis Tickets</span>
              </Link>

              {/* Dropdown de perfil */}
              <div className="nav-profile-menu" ref={menuRef}>
                <button
                  className="btn btn-secondary btn-sm nav-profile-btn"
                  onClick={() => setMenuOpen(prev => !prev)}
                  id="nav-my-profile"
                >
                  👤 {user.name}
                  <span className="nav-profile-chevron" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </button>

                {menuOpen && (
                  <div className="nav-profile-dropdown">
                    <Link
                      href="/my-profile"
                      className="nav-profile-dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      👤 Mi Perfil
                    </Link>
                    <div className="nav-profile-dropdown-divider" />
                    <button
                      className="nav-profile-dropdown-item nav-profile-dropdown-item--danger"
                      onClick={() => { logout(); setMenuOpen(false); }}
                    >
                      🚪 Salir
                    </button>
                  </div>
                )}
              </div>
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
