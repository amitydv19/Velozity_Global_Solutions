import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      className="card"
      style={{
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div>
        <strong>Real-Time Client Project Dashboard</strong>
        {user ? <span className="muted"> · {user.role.replace('_', ' ')}</span> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NotificationBell />
        {user ? (
          <>
            <span>{user.name}</span>
            <button className="btn secondary" type="button" onClick={() => void logout()}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
