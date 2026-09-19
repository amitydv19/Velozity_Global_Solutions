import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="card">
      <h1 className="page-title">Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <Link className="btn secondary" to="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
