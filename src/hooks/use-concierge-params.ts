import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ConciergeView = "itinerary" | "proposals";

export function useConciergeParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return {
    reservationParam: searchParams.get("reservation"),
    proposalParam: searchParams.get("proposal"),
    view: (searchParams.get("view") === "proposals"
      ? "proposals"
      : "itinerary") satisfies ConciergeView as ConciergeView,
    update,
  };
}
