export const AmbientBackground = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <div className="absolute inset-0 bg-(image:--ambient-warm)" />
    <div className="absolute inset-0 bg-(image:--ambient-rose)" />
    <div className="absolute inset-0 bg-(image:--ambient-flutes)" />
    <div className="bg-grain absolute inset-0 opacity-20 mix-blend-overlay" />
  </div>
);
