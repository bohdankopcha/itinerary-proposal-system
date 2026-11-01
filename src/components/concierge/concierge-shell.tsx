import { AmbientBackground } from "@/components/ambient-background";

export const ConciergeShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <AmbientBackground />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
};
