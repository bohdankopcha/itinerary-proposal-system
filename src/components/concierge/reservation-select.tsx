import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRange } from "@/lib/proposals/format";
import type { Reservation } from "@/lib/schemas/reservation";

export function ReservationSelect({
  reservations,
  value,
  onChange,
}: {
  reservations: Reservation[];
  value: string;
  onChange: (id: string) => void;
}) {
  const options = reservations.map((reservation) => ({
    value: reservation.id,
    label: `${reservation.member.name} · ${reservation.destination} · ${formatRange(reservation.arrivalDate, reservation.departureDate)}`,
  }));

  return (
    <Select
      value={value}
      items={options}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger aria-label="Reservation" className="w-full sm:w-96">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="min-w-96">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
