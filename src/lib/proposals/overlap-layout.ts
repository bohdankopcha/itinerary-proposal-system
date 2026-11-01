export type TimeSpan = {
  key: string;
  startMinutes: number;
  endMinutes: number;
};

export type SpanSlot = { key: string; column: number; columns: number };

/** Packs overlapping spans side by side: each overlap cluster gets as many equal columns as its widest moment needs. */
export const layoutOverlaps = (spans: TimeSpan[]): SpanSlot[] => {
  const sorted = [...spans].sort(
    (first, second) =>
      first.startMinutes - second.startMinutes ||
      second.endMinutes - first.endMinutes ||
      first.key.localeCompare(second.key),
  );

  const slots: SpanSlot[] = [];
  let cluster: { key: string; column: number }[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    for (const member of cluster)
      slots.push({ ...member, columns: columnEnds.length });
    cluster = [];
    columnEnds = [];
  };

  for (const span of sorted) {
    if (span.startMinutes >= clusterEnd) flush();
    const free = columnEnds.findIndex((end) => end <= span.startMinutes);
    const column = free === -1 ? columnEnds.length : free;
    columnEnds[column] = span.endMinutes;
    cluster.push({ key: span.key, column });
    clusterEnd = Math.max(clusterEnd, span.endMinutes);
  }
  flush();

  return slots;
};
