import type { Metadata } from "next";
import { LaunchConsole } from "@/components/LaunchConsole";
import { Chip } from "@/components/ui/Chip";
import { Section, StationHead } from "@/components/ui/Section";
import { launchConfig, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Console",
  description:
    "Fill in a pad, see the exact deployment call, and watch the interlocks that hold it. Nothing deploys: no factory contract exists yet.",
};

export default function LaunchPage() {
  return (
    <Section className="py-10 sm:py-14">
      <StationHead
        index="00"
        title="Launch console"
        aside={
          launchConfig.isLive ? (
            <Chip tone="live" lamp>
              Factory armed
            </Chip>
          ) : (
            <Chip tone="halt" lamp blink>
              Launches held
            </Chip>
          )
        }
      />
      <p className="mb-8 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
        Four stations, then the control. Everything you enter is validated the
        way the factory will validate it, and the panel on the right shows the
        exact call {siteConfig.wordmark} would send — including the base-unit
        supply, which is the number people get wrong by eighteen zeros. The
        control cannot fire while any interlock is open, and one of them cannot
        close at all until a factory is deployed.
      </p>
      <LaunchConsole />
    </Section>
  );
}
