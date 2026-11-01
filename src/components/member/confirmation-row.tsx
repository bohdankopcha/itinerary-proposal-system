export const ConfirmationRow = ({
  label,
  children,
  emphasized = false,
}: {
  label: string;
  children: React.ReactNode;
  emphasized?: boolean;
}) => {
  return (
    <div className="flex justify-between gap-4 border-b py-3 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          emphasized
            ? "text-2xl font-medium tracking-tight tabular-nums"
            : "text-right font-medium tabular-nums"
        }
      >
        {children}
      </dd>
    </div>
  );
};
