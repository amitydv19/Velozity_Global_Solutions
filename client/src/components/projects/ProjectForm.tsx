import { useState } from 'react';
import type { Client } from '../../types';

export function ProjectForm({
  clients,
  initial,
  onSubmit,
}: {
  clients: Client[];
  initial?: { name: string; description?: string; clientId: string };
  onSubmit: (values: { name: string; description?: string; clientId: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [clientId, setClientId] = useState(initial?.clientId ?? clients[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        void onSubmit({ name, description, clientId })
          .catch(() => setError('Failed to save project'))
          .finally(() => setLoading(false));
      }}
    >
      <label className="form-field">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="form-field">
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>
      <label className="form-field">
        Client
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      {error ? <p style={{ color: '#dc2626' }}>{error}</p> : null}
      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save project'}
      </button>
    </form>
  );
}
