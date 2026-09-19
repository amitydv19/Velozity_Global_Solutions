import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/common/ErrorMessage';

const DEMO_USERS = [
  { label: 'Admin', email: 'admin@dashboard.local', role: 'Full System Access' },
  { label: 'PM 1 (Morgan)', email: 'pm1@dashboard.local', role: 'Manages Acme & Globex' },
  { label: 'PM 2 (Jordan)', email: 'pm2@dashboard.local', role: 'Manages Initech' },
  { label: 'Developer 1 (Sam)', email: 'dev1@dashboard.local', role: 'Assigned Dev Tasks' },
  { label: 'Developer 2 (Riley)', email: 'dev2@dashboard.local', role: 'Assigned Dev Tasks' },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@dashboard.local');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    void login(email, password)
      .then(() => navigate('/dashboard'))
      .catch(() => setError('Invalid email or password'))
      .finally(() => setLoading(false));
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header-hero">
          <h1 className="login-brand-title">Client Project Dashboard</h1>
          <p className="login-brand-subtitle">
            Enterprise real-time management with strict role-based access control & live Socket.IO
            feeds
          </p>
        </div>

        <div className="card login-card">
          <h2 className="login-card-title">Sign In</h2>
          <p className="muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Enter your credentials or click any demo account below to auto-fill.
          </p>

          <form onSubmit={onSubmit}>
            <label className="form-field">
              <span>Email Address</span>
              <input
                type="email"
                placeholder="name@dashboard.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error ? <ErrorMessage message={error} /> : null}

            <button className="btn btn-primary-full" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="demo-accounts-section">
            <div className="demo-divider">
              <span>Quick Test Personas</span>
            </div>
            <div className="demo-pills-grid">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  className={`demo-pill-btn ${email === demo.email ? 'active' : ''}`}
                  onClick={() => fillCredentials(demo.email)}
                >
                  <span className="demo-pill-label">{demo.label}</span>
                  <span className="demo-pill-sub">{demo.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
