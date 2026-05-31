'use client';

import { AfroEventosLogo } from './AfroEventosLogo';

interface SidebarProps {
  user: { name: string; email: string; role: string } | null;
  activeView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

export function Sidebar({
  user,
  activeView,
  onNavigate,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL || 'https://afroeventos.com'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ir al portal de clientes"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <AfroEventosLogo variant="light" height={50} />
        </a>
        <span className="logo-badge" style={{ color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.1)' }}>ADMIN</span>
      </div>

      <nav className="sidebar-nav">
        <a
          href="#"
          className={activeView === 'inicio' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('inicio');
          }}
          style={activeView === 'inicio' ? { borderLeftColor: '#8b5cf6', color: '#8b5cf6' } : {}}
        >
          <span className="nav-icon">🏠</span>
          Inicio
        </a>
        <a
          href="#"
          className={activeView === 'dashboard' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('dashboard');
          }}
          style={activeView === 'dashboard' ? { borderLeftColor: '#8b5cf6', color: '#8b5cf6' } : {}}
        >
          <span className="nav-icon">🏢</span>
          Organizadores
        </a>
        <a
          href="#"
          className={activeView === 'analytics' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('analytics');
          }}
          style={activeView === 'analytics' ? { borderLeftColor: '#8b5cf6', color: '#8b5cf6' } : {}}
        >
          <span className="nav-icon">📊</span>
          Analíticas
        </a>
        <a
          href="#"
          className={activeView === 'events' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('events');
          }}
          style={activeView === 'events' ? { borderLeftColor: '#8b5cf6', color: '#8b5cf6' } : {}}
        >
          <span className="nav-icon">🌟</span>
          Eventos
        </a>
        <a
          href="#"
          className={activeView === 'banners' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('banners');
          }}
          style={activeView === 'banners' ? { borderLeftColor: '#8b5cf6', color: '#8b5cf6' } : {}}
        >
          <span className="nav-icon">📢</span>
          Banners Publicitarios
        </a>
        {user?.role === 'ADMIN' && (
          <a
            href="#"
            className={activeView === 'plans' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('plans');
            }}
            style={activeView === 'plans' ? { borderLeftColor: '#8b5cf6', color: '#8b5cf6' } : {}}
          >
            <span className="nav-icon">💎</span>
            Planes
          </a>
        )}
        {user?.role === 'ADMIN' && (
          <a
            href="#"
            className={activeView === 'users' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('users');
            }}
            style={activeView === 'users' ? { borderLeftColor: '#8b5cf6', color: '#8b5cf6' } : {}}
          >
            <span className="nav-icon">👥</span>
            Usuarios
          </a>
        )}
      </nav>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar" style={{backgroundColor: '#6d28d9'}}>{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role} GLOBAL</div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition-fast)',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
