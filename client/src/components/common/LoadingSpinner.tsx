export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="card" role="status" aria-live="polite">
      <p className="muted">{label}</p>
    </div>
  );
}
