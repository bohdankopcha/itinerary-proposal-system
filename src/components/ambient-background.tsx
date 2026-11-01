export const AmbientBackground = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="motion-safe:animate-ambient-drift absolute -inset-24 bg-(image:--ambient-warm) blur-2xl" />
      <div className="motion-safe:animate-ambient-drift-slow absolute -inset-24 bg-(image:--ambient-rose) blur-2xl" />
      <div className="absolute inset-0 bg-(image:--ambient-flutes) backdrop-blur-sm backdrop-saturate-150" />
      <svg className="absolute inset-0 size-full opacity-20 mix-blend-overlay">
        <filter id="ambient-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ambient-grain)" />
      </svg>
    </div>
  );
};
