import type { Metadata } from "next";
import Link from "next/link";
import { PadRegistry } from "@/components/PadRegistry";
import { Verify } from "@/components/Verify";
import { Chip } from "@/components/ui/Chip";
import { Section, StationHead } from "@/components/ui/Section";
import { bpsToPercent, splitTerms } from "@/lib/economics";
import { launchConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Pads",
  description:
    "Every pad ever launched, read from the factory contract by your own browser. There are none: no factory is deployed.",
};

export default function PadsPage() {
  return (
    <Section className="py-10 sm:py-14">
      <StationHead
        index="R"
        title="Registry"
        aside={
          launchConfig.isLive ? (
            <Chip tone="live" lamp>
              Reading factory
            </Chip>
          ) : (
            <Chip tone="held" lamp>
              Awaiting launch
            </Chip>
          )
        }
      />
      <p className="mb-8 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
        Every pad launched from the factory, newest first, read straight from the
        contract by your browser. Each row&rsquo;s fee and split come from the pad
        itself rather than from this site, so a pad that disagrees with the terms
        below would show it here.
      </p>

      <PadRegistry />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="glass p-6">
          <p className="label">Terms every pad in this registry was built on</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Protocol share",
                value: bpsToPercent(splitTerms.platformShareBps),
              },
              {
                label: "Holder floor",
                value: bpsToPercent(splitTerms.minHolderShareBps),
              },
              { label: "Launch fee", value: "0" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="label">{item.label}</dt>
                <dd className="mono num mt-1.5 text-[20px]">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-rule pt-5 text-[12px] leading-relaxed text-ink-faint">
            Read these off the factory rather than off this page — it exposes
            both as public functions for exactly that reason. A front end can
            print anything.
          </p>
        </div>
        <Verify />
      </div>

      <div className="mt-8">
        <Link
          href="/launch"
          className="pill pill-lime"
        >
          Launch one
        </Link>
      </div>
    </Section>
  );
}
