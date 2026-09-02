import Link from "next/link";
import { bpsToPercent, splitTerms } from "@/lib/economics";
import { launchConfig, siteConfig } from "@/lib/site-config";
import { robinhoodChain } from "@/lib/chain";
import { Chip } from "./ui/Chip";
import { RigHead, Readout } from "./ui/Section";

/**
 * The hero is the machine's own status panel, and it reads "held".
 *
 * Every counter is a dash rather than a zero dressed up as traction, and the
 * launch control shows the hazard face it will show any creator whose
 * interlocks are open. The first thing a visitor learns about this launchpad
 * is the state it is actually in.
 */
export function Hero() {
  return (
    <section className="border-b border-rule-2">
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <div className="rise">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="muted">Launchpad</Chip>
            <Chip tone="muted">{robinhoodChain.name}</Chip>
            {launchConfig.isLive ? (
              <Chip tone="live" lamp>
                Factory armed
              </Chip>
            ) : (
              <Chip tone="halt" lamp blink>
                No factory deployed
              </Chip>
            )}
          </div>

          <h1 className="stencil mt-6 text-[clamp(2.4rem,6.4vw,4.4rem)] leading-[0.94] tracking-[-0.02em] text-balance">
            Launch a token
            <br />
            that pays its holders
            <br />
            in stock.
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-dim">
            {siteConfig.wordmark} deploys one contract: a token whose trading
            fees buy a tokenized equity and hand it to the people holding it. You
            pick the asset, you set the fee, you set your own share. The split is
            burned in at deploy and nobody — you, us, anyone — can move it
            afterwards.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/launch" className="control">
              Open the console
            </Link>
            <Link
              href="/#mechanism"
              className="mono border border-rule-2 px-4 py-3 text-[11px] tracking-[0.2em] text-ink uppercase transition hover:border-halt-ink hover:text-halt-ink"
            >
              How it works
            </Link>
          </div>

          <p className="mono mt-6 text-[11px] leading-relaxed tracking-[0.06em] text-ink-faint uppercase">
            Free to launch · {bpsToPercent(splitTerms.platformShareBps)} of
            collected fees to the protocol · at least{" "}
            {bpsToPercent(splitTerms.minHolderShareBps)} to holders, always
          </p>
        </div>

        <div className="rig bolted rise">
          <RigHead
            title="Pad 000"
            aside={
              <Chip tone="panel" lamp blink>
                Held
              </Chip>
            }
          />
          <dl className="grid grid-cols-3 gap-px bg-panel-rule">
            {[
              { label: "Pads launched", value: "0" },
              { label: "Fees routed", value: null },
              { label: "Distributed", value: null },
            ].map((stat) => (
              <div key={stat.label} className="bg-panel px-4 py-5">
                <dt className="label label-on-panel">{stat.label}</dt>
                <dd className="mono num mt-2 text-[26px] leading-none text-panel-ink">
                  {stat.value ?? (
                    <Readout
                      value={null}
                      width="2.5rem"
                      title="No factory deployed — nothing to read"
                      className="text-panel-faint"
                    />
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="p-4">
            <div
              className="hazard flex h-[92px] items-center justify-center border border-black"
              aria-hidden
            >
              <span className="mono bg-panel px-4 py-2 text-[12px] tracking-[0.3em] text-panel-ink uppercase">
                Launch held
              </span>
            </div>
            <p className="mono mt-3 text-[11px] leading-relaxed text-panel-dim">
              Interlock 1 of 9 · <span className="text-halt-bright">Factory</span>{" "}
              — not deployed.{" "}
              <span className="text-panel-faint">
                The console runs anyway: fill it in, see the exact call, watch the
                chain refuse it.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
