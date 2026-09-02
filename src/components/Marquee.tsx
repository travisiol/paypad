const STEPS = [
  "TRADE",
  "FEE TAKEN",
  "SWAP TO PAYOUT ASSET",
  "ACCRUE PER HOLDER",
  "CLAIM",
];

/**
 * The tape carries the mechanism, not prices.
 *
 * A scrolling price ticker would be fabricated market data on a site whose
 * whole argument is that it fabricates nothing — so the loop is the five steps
 * a fee actually takes, and it is the same five steps the schematic draws.
 */
export function Marquee() {
  const run = [...STEPS, ...STEPS, ...STEPS, ...STEPS];

  return (
    <div className="overflow-hidden border-y border-rule bg-white/40 py-3">
      <div
        className="animate-marquee flex w-max items-center gap-8 pr-8"
        aria-hidden
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-8">
            {run.map((step, index) => (
              <span
                key={`${copy}-${index}`}
                className="mono flex items-center gap-8 text-[11px] tracking-[0.22em] whitespace-nowrap text-ink-faint uppercase"
              >
                {step}
                <span className="text-lime-deep">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">
        A fee takes five steps: trade, fee taken, swap to the payout asset,
        accrue per holder, claim.
      </span>
    </div>
  );
}
