import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { RouteDiagram } from "@/components/RouteDiagram";
import { SplitBar } from "@/components/SplitBar";
import { Estimator } from "@/components/Estimator";
import { ChainReadout } from "@/components/ChainReadout";
import { PadRegistry } from "@/components/PadRegistry";
import { Questions } from "@/components/Questions";
import { Verify } from "@/components/Verify";
import { GlassAsterisk } from "@/components/Glass";
import { Chip } from "@/components/ui/Chip";
import { Section, StationHead } from "@/components/ui/Section";
import {
  bpsToPercent,
  defaultCreatorShareBps,
  feeBounds,
  maxCreatorShareBps,
  splitTerms,
} from "@/lib/economics";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />

      {/* ------------------------------------------------------------ 01 */}
      <Section id="mechanism">
        <div data-reveal>
          <StationHead
            index="01"
            title="One trade, four destinations"
            aside={<Chip>Schematic</Chip>}
          />
          <div className="glass overflow-x-auto p-5 sm:p-7">
            <RouteDiagram
              tradeFeeBps={feeBounds.defaultTradeFeeBps}
              creatorShareBps={defaultCreatorShareBps}
              className="h-auto w-full min-w-[720px]"
            />
          </div>
          <p className="mono mt-4 text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            Drawn at the default settings. Every pad sets its own — the shape
            does not change, the widths do.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                head: "The fee is taken",
                body: "A percentage of each trade in your token is withheld by the token itself. The rest of the trade is untouched. The percentage is fixed when the pad is deployed and there is no function to change it.",
              },
              {
                head: "The fee is swapped",
                body: "Collected fees are swapped into the payout asset you chose — a tokenized equity living on the same chain, so nothing is bridged, wrapped, or held for anybody.",
              },
              {
                head: "Holders accrue, then claim",
                body: "Each holder's share accrues in the pad and they claim it when they want it. No pad iterates its holders; that is why this works at a thousand holders as well as at ten.",
              },
            ].map((item, index) => (
              <div key={item.head}>
                <span className="mono text-[11px] text-lime-deep">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="display mt-2.5 text-[18px]">{item.head}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-dim">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ 02 */}
      <Section id="split">
        <div data-reveal>
          <StationHead
            index="02"
            title="Where the fee goes"
            aside={<Chip tone="held">Proposed terms</Chip>}
          />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
            <div>
              <SplitBar
                tradeFeeBps={feeBounds.defaultTradeFeeBps}
                creatorShareBps={defaultCreatorShareBps}
              />
              <p className="mt-7 max-w-2xl text-[14px] leading-relaxed text-ink-dim">
                A creator sets the trading fee between{" "}
                {bpsToPercent(feeBounds.minTradeFeeBps)} and{" "}
                {bpsToPercent(feeBounds.maxTradeFeeBps)}, and sets their own
                share of it up to {bpsToPercent(maxCreatorShareBps)}. The
                protocol takes {bpsToPercent(splitTerms.platformShareBps)}. What
                is left goes to holders, which is why the holder share can never
                fall below {bpsToPercent(splitTerms.minHolderShareBps)} — it is
                the remainder, not a promise.
              </p>
              <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-dim">
                Launching costs gas and nothing else. There is no listing fee,
                no token sale, and the protocol never takes a share of your
                supply — only of the fees your pad produces. If your pad never
                trades, this launchpad earns nothing from it, which is the whole
                reason the door is free.
              </p>
            </div>

            <div className="glass p-6">
              <p className="label">Fixed at deploy</p>
              <ul className="mt-5 space-y-3.5">
                {[
                  "Total supply",
                  "Trading fee",
                  "Creator share",
                  "Protocol share",
                  "Payout asset",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span aria-hidden className="lamp lamp-held" />
                    <span className="mono text-[12px] tracking-[0.06em] uppercase">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-rule pt-5 text-[12px] leading-relaxed text-ink-faint">
                None of these has a setter. A pad is a finished object the
                moment it is deployed — that is the guarantee being sold here,
                and it is also the reason to get the numbers right before you
                press the control.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Estimator />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ 03 */}
      <Section id="one-click">
        <div data-reveal>
          <StationHead
            index="03"
            title="What one click actually does"
            aside={<Chip>One transaction</Chip>}
          />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <ol className="rail space-y-7 pl-7">
              {[
                {
                  head: "Deploys your token",
                  body: "A copy of one audited-once pad template, with your name, ticker and supply. Same bytecode as every other pad, so anyone can diff it against the template rather than trust it.",
                },
                {
                  head: "Burns in the split",
                  body: "Your fee, your share, the protocol share and the payout asset are written as immutable values. No admin key, no proxy, no upgrade path.",
                },
                {
                  head: "Registers the pad",
                  body: "The factory records it so the registry on this site — and anyone else's — can list it without an indexer.",
                },
                {
                  head: "Mints the supply to you",
                  body: "All of it, to the deploying wallet. The protocol takes none of your token, ever.",
                },
                {
                  head: "Hands you back an address",
                  body: "From that point the pad is yours and this site is optional. Every number it reports can be read off the contract.",
                },
              ].map((step, index) => (
                <li key={step.head} className="relative">
                  <span className="mono absolute top-0.5 -left-7 text-[11px] text-lime-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display text-[17px]">{step.head}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>

            <div className="slab self-start overflow-hidden">
              <div className="slab-head">
                <span>What it does not do</span>
                <Chip tone="slate">Read this</Chip>
              </div>
              <ul className="divide-y divide-slate-rule">
                {[
                  {
                    head: "It does not create a market",
                    body: "A deployed token with no liquidity trades nothing and therefore pays nothing. Seeding and funding a pool is your job, and it is the step most launches actually fail at.",
                  },
                  {
                    head: "It does not vet the payout asset",
                    body: "The pad buys the contract it was handed. Checking that the address is the asset you think it is happens before you launch, by you.",
                  },
                  {
                    head: "It does not make the payout legal where you are",
                    body: "Distributing equity exposure is a regulated activity in most places. The protocol is plumbing; the deployer is the responsible party.",
                  },
                  {
                    head: "It does not promise anyone a return",
                    body: "A pad routes a share of whatever volume happens. Volume can be zero, and usually is.",
                  },
                ].map((item) => (
                  <li key={item.head} className="px-6 py-5">
                    <h3 className="mono text-[12px] tracking-[0.06em] text-[#b7e56a] uppercase">
                      {item.head}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-dim">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ 04 */}
      <Section id="chain">
        <div data-reveal>
          <StationHead
            index="04"
            title="The chain is live. This is not."
            aside={<Chip>Read by your browser</Chip>}
          />
          <ChainReadout />
          <p className="mt-6 max-w-2xl text-[14px] leading-relaxed text-ink-dim">
            Those figures are read from the RPC endpoint by your own browser,
            every six seconds, with nothing in between. The counters on this
            site&rsquo;s own pads are dashes, because there are no pads. Both
            things are shown because both are true, and a launchpad that borrows
            a chain&rsquo;s liveness to look busy is doing the first dishonest
            thing on a long list.
          </p>
          <div className="mt-10">
            <Verify />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ 05 */}
      <Section id="registry">
        <div data-reveal>
          <StationHead
            index="05"
            title="Every pad ever launched"
            aside={<Chip>Read from the factory</Chip>}
          />
          <PadRegistry />
          <div className="mt-7">
            <Link href="/pads" className="pill pill-ghost">
              Open the registry
            </Link>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ 06 */}
      <Section id="questions">
        <div data-reveal>
          <StationHead index="06" title="Questions" />
          <Questions />
        </div>
      </Section>

      <section className="relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6">
          <div className="slab relative overflow-hidden px-6 py-16 sm:px-12 sm:py-20">
            <GlassAsterisk
              id="cta-star"
              className="pointer-events-none absolute -right-16 -bottom-24 h-[320px] w-[320px] opacity-40 blur-[3px]"
            />
            <div className="relative max-w-3xl">
              <h2 className="display text-[clamp(1.9rem,4.4vw,3rem)] text-slate-ink text-balance">
                The console runs today. The chain will refuse it today.
              </h2>
              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-dim">
                Fill in a pad, watch the interlocks close one by one, read the
                exact call {siteConfig.wordmark} would send. The last interlock
                is a factory contract that does not exist yet — and until it
                does, that is the only thing standing between the draft and a
                deployment.
              </p>
              <div className="mt-9">
                <Link href="/launch" className="pill pill-lime">
                  Open the console
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
