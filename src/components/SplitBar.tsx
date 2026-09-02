import { bpsToPercent, percentOfTrade, splitOf, BPS } from "@/lib/economics";

/**
 * Where a collected fee goes, drawn to scale.
 *
 * The protocol's slice is the smallest one on the bar and it is drawn at full
 * size rather than tucked into a footnote, because a launchpad that hides its
 * own cut is the thing every creator is right to be looking for.
 */
export function SplitBar({
  tradeFeeBps,
  creatorShareBps,
  showTradeShare = true,
}: {
  tradeFeeBps: number;
  creatorShareBps: number;
  showTradeShare?: boolean;
}) {
  const split = splitOf(creatorShareBps);

  const legs = [
    {
      key: "holders",
      label: "Holders",
      note: "buys the payout asset",
      bps: split.holderShareBps,
      bar: "bg-gradient-to-b from-[#e9fdbd] to-[#c7ee72]",
      dot: "bg-[#8fd43a]",
      text: "text-lime-deep",
    },
    {
      key: "creator",
      label: "Creator",
      note: "the launcher's treasury",
      bps: split.creatorShareBps,
      bar: "bg-gradient-to-b from-[#f7f9f7] to-[#c2cbc5]",
      dot: "bg-chrome-4",
      text: "text-ink",
    },
    {
      key: "protocol",
      label: "Protocol",
      note: "this launchpad's only revenue",
      bps: split.platformShareBps,
      bar: "bg-gradient-to-b from-[#4a4f50] to-[#26292a]",
      dot: "bg-slate",
      text: "text-ink",
    },
  ];

  return (
    <div>
      <div
        className="flex h-10 w-full gap-1 overflow-hidden rounded-full border border-rule-2 bg-white/50 p-1"
        role="img"
        aria-label={legs
          .map((leg) => `${leg.label} ${bpsToPercent(leg.bps)} of the fee`)
          .join(", ")}
      >
        {legs.map((leg) => (
          <div
            key={leg.key}
            className={`rounded-full ${leg.bar}`}
            style={{ width: `calc(${(leg.bps / BPS) * 100}% - 0.25rem)` }}
          />
        ))}
      </div>
      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {legs.map((leg) => (
          <div key={leg.key} className="glass px-4 py-4">
            <dt className="flex items-center gap-2">
              <span aria-hidden className={`lamp ${leg.dot}`} />
              <span className="label">{leg.label}</span>
            </dt>
            <dd className={`mono num mt-2.5 text-[22px] leading-none ${leg.text}`}>
              {bpsToPercent(leg.bps)}
            </dd>
            <dd className="mt-2.5 text-[11px] leading-snug text-ink-faint">
              {leg.note}
              {showTradeShare && (
                <>
                  {" · "}
                  <span className="mono num">
                    {percentOfTrade(tradeFeeBps, leg.bps)}%
                  </span>{" "}
                  of each trade
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
