import { Panel } from "@/components/panel";

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Panel className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm">{description}</p>
      {children}
    </Panel>
  );
}
