// Announced once by screen readers through the status role; the ring itself
// is decoration.
export default function Spinner({ label = "Carregando…" }: { label?: string }) {
  return (
    <div role="status" className="flex justify-center py-sm">
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-outline-common border-t-primary-dark"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
