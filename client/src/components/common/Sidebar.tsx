import { NavLink } from 'react-router-dom';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'block',
  padding: '0.65rem 0.85rem',
  borderRadius: 8,
  background: isActive ? '#dbeafe' : 'transparent',
  color: isActive ? '#1d4ed8' : '#0f172a',
});

export function Sidebar() {
  const { isAdmin, isPm, isDeveloper } = useRoleAccess();

  return (
    <aside className="card" style={{ borderRadius: 0, minHeight: '100vh' }}>
      <nav style={{ display: 'grid', gap: '0.35rem' }}>
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>
        {!isDeveloper ? (
          <NavLink to="/projects" style={linkStyle}>
            Projects
          </NavLink>
        ) : null}
        <NavLink to="/tasks" style={linkStyle}>
          Tasks
        </NavLink>
        <NavLink to="/notifications" style={linkStyle}>
          Notifications
        </NavLink>
        {(isAdmin || isPm) && (
          <span className="muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
            Role tools are enforced server-side.
          </span>
        )}
      </nav>
    </aside>
  );
}
