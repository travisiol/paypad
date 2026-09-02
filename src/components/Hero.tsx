import Link from "next/link";
import { clsx } from "clsx";
import { bpsToPercent, splitTerms } from "@/lib/economics";
import { launchConfig, siteConfig } from "@/lib/site-config";
import { robinhoodChain } from "@/lib/chain";
import { emptyDraft, firstOpen, interlocksFor } from "@/lib/launch-plan";
import { registryIsEmpty } from "@/lib/payout-assets";
import { Chip } from "./ui/Chip";
import { Readout } from "./ui/Section";
import { DraftLines, GlassArrow, GlassAsterisk } from "./Glass";

/**
 * The hero is the pad's own status panel, and it reads "awaiting launch".
 *
 * Every counter is a dash rather than a zero dressed up as traction, and the
 * strip under them is the real interlock chain — computed from the same
 * function the console uses, on an empty draft, so the segments the home page
 * lights are exactly the ones a visitor will find when they open `/launch`. A
 * flat "held" plate sat here before and said nothing; this says which link is
 * open and how many are left.
 *
 * The glass objects are decoration and are marked as such: aria-hidden,
 * pointer-events-none, and sitting behind the text rather than around it, so
 * nothing here competes with the sentence that has to be read first.
 */
export function Hero() {
  const interlocks = interlocksFor(emptyDraft, {
    factoryAddress: launchConfig.factoryAddress,
    isLive: launchConfig.isLive,
    expectedChainId: robinhoodChain.id,
    registryHasAssets: !registryIsEmpty,
  });
  const closed = interlocks.filter((interlock) => interlock.closed).length;
  const blocker = firstOpen(interlocks);

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <DraftLines className="absolute inset-0 h-full w-full" />
        <GlassAsterisk
          id="hero-star"
          className="animate-drift absolute -bottom-24 -left-24 h-[380px] w-[380px] opacity-90 blur-[5px] sm:-bottom-28 sm:-left-20 sm:h-[460px] sm:w-[460px]"
        />
        <GlassArrow
          id="hero-arrow"
          className="absolute -top-6 -right-20 h-[160px] w-[160px] opacity-95 sm:-top-4 sm:-right-12 sm:h-[250px] sm:w-[250px]"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
        <div className="rise mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Chip>Launchpad</Chip>
            <Chip>{robinhoodChain.name}</Chip>
            {launchConfig.isLive ? (
              <Chip tone="live" lamp>
                Factory armed
              </Chip>
            ) : (
              <Chip tone="held" lamp>
                Awaiting launch
              </Chip>
            )}
          </div>

          <h1 className="display mt-7 text-[clamp(2.6rem,7.2vw,5.2rem)] text-balance">
            Launch a token that pays its holders in stock.
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-ink-dim">
            {siteConfig.wordmark} deploys one contract: a token whose trading
            fees buy a tokenized equity and hand it to the people holding it.
            You pick the asset, you set the fee, you set your own share. The
            split is burned in at deploy and nobody — you, us, anyone — can move
            it afterwards.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/launch" className="pill pill-dark">
              Open the console
            </Link>
            <Link href="/#mechanism" className="pill pill-ghost">
              How it works
            </Link>
          </div>

          <p className="mono mt-7 text-[11px] leading-relaxed tracking-[0.06em] text-ink-faint uppercase">
            Free to launch · {bpsToPercent(splitTerms.platformShareBps)} of
            collected fees to the protocol · at least{" "}
            {bpsToPercent(splitTerms.minHolderShareBps)} to holders, always
          </p>
        </div>

        <div className="rise glass mx-auto mt-14 max-w-4xl overflow-hidden">
          <div className="glass-head">
            <span>Pad 000</span>
            <Chip tone="held" lamp>
              Awaiting launch
            </Chip>
          </div>
          <dl className="grid grid-cols-1 divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { label: "Pads launched", value: "0" },
              { label: "Fees routed", value: null },
              { label: "Distributed", value: null },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-6">
                <dt className="label">{stat.label}</dt>
                <dd className="mono num mt-2.5 text-[30px] leading-none">
                  {stat.value ?? (
                    <Readout
                      value={null}
                      width="2.5rem"
                      title="Awaiting launch — nothing to read yet"
                    />
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-rule px-6 py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="label">Interlock chain</span>
              <span className="mono num text-[11px] text-ink-faint">
                {closed} of {interlocks.length} closed
              </span>
            </div>
            <div
              className="mt-3.5 flex gap-1.5"
              role="img"
              aria-label={`${closed} of ${interlocks.length} interlocks closed. The first open one is ${blocker?.label ?? "none"}.`}
            >
              {interlocks.map((interlock) => (
                <span
                  key={interlock.id}
                  title={`${interlock.label} — ${interlock.status}`}
                  className={clsx(
                    "h-1.5 flex-1 rounded-full",
                    interlock.closed
                      ? "bg-gradient-to-b from-[#dcfa9c] to-[#a9dc4c]"
                      : "bg-gradient-to-b from-[#e6eae7] to-[#c6cec9]",
                  )}
                />
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
              First open link · <span className="text-ink">{blocker?.label}</span>{" "}
              — {blocker?.status}.{" "}
              <span className="text-ink-faint">
                The console runs anyway: fill it in, watch the segments close,
                read the exact call it would send.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
