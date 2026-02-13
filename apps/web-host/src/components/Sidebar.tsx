'use client';

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
          <span className="nav-icon">📊</span>
          Dashboard
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
      </nav>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition-fast)',
              fontSize: '1rem',
            }}
          >
            🚪
          </button>
        </div>
      )}
    </aside>
  );
}
