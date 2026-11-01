import { AmbientBackground } from "@/components/ambient-background";

export const MemberShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-dvh">
      <AmbientBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-5.5 px-4 pt-7 pb-36 lg:pt-14">
        {children}
      </main>
    </div>
  );
};
