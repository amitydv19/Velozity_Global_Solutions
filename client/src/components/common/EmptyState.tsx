export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {description ? <p className="muted">{description}</p> : null}
    </div>
  );
}
