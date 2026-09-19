export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="card" style={{ borderColor: '#fecaca', color: '#991b1b' }}>
      {message}
    </div>
  );
}
