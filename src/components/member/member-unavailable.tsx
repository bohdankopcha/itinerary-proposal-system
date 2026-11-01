import { Eyebrow } from "@/components/eyebrow";
import { Panel } from "@/components/panel";

export const MemberUnavailable = () => {
  return (
    <Panel
      as="section"
      aria-labelledby="unavailable-title"
      className="motion-safe:animate-rise mt-16 flex flex-col items-center gap-3 rounded-3xl p-8 text-center"
    >
      <Eyebrow>Private itinerary</Eyebrow>
      <h1
        id="unavailable-title"
        className="text-3xl leading-tight font-semibold tracking-tighter"
      >
        This itinerary isn’t available yet.
      </h1>
      <p className="text-muted-foreground max-w-sm">
        If you were expecting one, your concierge will be in touch as soon as it
        is ready for you.
      </p>
    </Panel>
  );
};
