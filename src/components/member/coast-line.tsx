export const COAST_PATH =
  "M0 92 C26 90 48 100 64 114 C76 124 88 124 102 114 C128 96 160 98 190 120 C222 144 248 176 290 184 C326 190 360 178 400 194";

export const CoastLine = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 400 220" aria-hidden className={className}>
      <path
        d={COAST_PATH}
        pathLength={1}
        fill="none"
        strokeWidth={1.3}
        strokeLinecap="round"
        className="draw-path stroke-primary-foreground"
      />
      <circle cx={64} cy={114} r={4} className="fill-primary-foreground" />
    </svg>
  );
};
