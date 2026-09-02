import Link from "next/link";
import { bpsToPercent, splitTerms } from "@/lib/economics";
import { launchConfig, siteConfig } from "@/lib/site-config";
import { robinhoodChain } from "@/lib/chain";
import { Chip } from "./ui/Chip";
import { Readout } from "./ui/Section";
import { DraftLines, GlassArrow, GlassAsterisk } from "./Glass";

/**
 * The hero is the machine's own status panel, and it reads "held".
 *
 * Every counter is a dash rather than a zero dressed up as traction, and the
 * launch control shows the held face it will show any creator whose interlocks
 * are open. The first thing a visitor learns about this launchpad is the state
 * it is actually in.
 *
 * The glass objects are decoration and are marked as such: aria-hidden,
 * pointer-events-none, and sitting behind the text rather than around it, so
 * nothing here competes with the sentence that has to be read first.
 */
export function Hero() {
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
                No factory deployed
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
              Held
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
                      title="No factory deployed — nothing to read"
                    />
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-rule p-5">
            <div className="held-plate flex h-[96px] items-center justify-center">
              <span className="mono text-[12px] tracking-[0.3em] text-ink-dim uppercase">
                Launch held
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
              Interlock 1 of 9 · <span className="text-ink">Factory</span> — not
              deployed.{" "}
              <span className="text-ink-faint">
                The console runs anyway: fill it in, see the exact call, watch
                the chain refuse it.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
