export function StatsCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card">
      <p className="muted" style={{ margin: 0 }}>
        {label}
      </p>
      <h2 style={{ margin: '0.35rem 0' }}>{value}</h2>
      {hint ? (
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
