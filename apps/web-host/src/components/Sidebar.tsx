'use client';

interface SidebarProps {
  user: { name: string; email: string; role: string; organizerProfile?: { organizationLogo?: string } } | null;
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
        <span className="logo-icon">🎫</span>
        OpenTicket
        <span className="logo-badge">HOST</span>
      </div>

      <nav className="sidebar-nav">
        <a
          href="#"
          className={activeView === 'dashboard' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('dashboard');
          }}
        >
          <span className="nav-icon">🏠</span>
          Inicio
        </a>
        <a
          href="#"
          className={activeView === 'create' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('create');
          }}
        >
          <span className="nav-icon">➕</span>
          Crear Evento
        </a>
        <a
          href="#"
          className={activeView === 'events' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('events');
          }}
        >
          <span className="nav-icon">🎪</span>
          Mis Eventos
        </a>
        <a
          href="#"
          className={activeView === 'attendees' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('attendees');
          }}
        >
          <span className="nav-icon">👥</span>
          Asistentes
        </a>
        <a
          href="#"
          className={activeView === 'scanner' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate('scanner');
          }}
        >
          <span className="nav-icon">📷</span>
          Escáner de Tickets
        </a>
      </nav>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar" style={user.organizerProfile?.organizationLogo ? { overflow: 'hidden', padding: 0 } : {}}>
            {user.organizerProfile?.organizationLogo ? (
              <img src={user.organizerProfile.organizationLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
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
