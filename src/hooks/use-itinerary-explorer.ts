import { useRef, useState } from "react";

export type ExplorerMode = "cards" | "timeline";

const SWIPE_DISTANCE = 48;
const SWIPE_CLICK_GUARD_MS = 60;

export const useItineraryExplorer = (dayCount: number) => {
  const [mode, setMode] = useState<ExplorerMode>("cards");
  const [day, setDay] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [openCard, setOpenCard] = useState<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const justSwiped = useRef(false);

  const goTo = (next: number) => {
    if (next < 0 || next >= dayCount || next === day) return;
    setDirection(next > day ? "right" : "left");
    setDay(next);
    setOpenCard(null);
  };

  const changeMode = (next: ExplorerMode) => {
    setMode(next);
    setOpenCard(null);
  };

  const toggleCard = (index: number) => {
    if (justSwiped.current) return;
    setOpenCard((current) => (current === index ? null : index));
  };

  const onPointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.4) {
      justSwiped.current = true;
      setTimeout(() => {
        justSwiped.current = false;
      }, SWIPE_CLICK_GUARD_MS);
      goTo(day + (dx < 0 ? 1 : -1));
    }
  };

  return {
    mode,
    day,
    direction,
    openCard,
    atFirst: day === 0,
    atLast: day >= dayCount - 1,
    setMode: changeMode,
    goTo,
    prev: () => goTo(day - 1),
    next: () => goTo(day + 1),
    toggleCard,
    onPointerDown,
    onPointerUp,
  };
};

export type ItineraryExplorerState = ReturnType<typeof useItineraryExplorer>;
