import { bpsToPercent, percentOfTrade, splitOf, BPS } from "@/lib/economics";

/**
 * Where a collected fee goes, drawn to scale.
 *
 * The protocol's slice is coloured, and it is the smallest one on the bar. It
 * is drawn at full size rather than tucked into a footnote because a launchpad
 * that hides its own cut is the thing every creator is right to be looking for.
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
      bar: "bg-live",
      text: "text-live",
    },
    {
      key: "creator",
      label: "Creator",
      note: "the launcher's treasury",
      bps: split.creatorShareBps,
      bar: "bg-ink",
      text: "text-ink",
    },
    {
      key: "protocol",
      label: "Protocol",
      note: "this launchpad's only revenue",
      bps: split.platformShareBps,
      bar: "bg-halt",
      text: "text-halt-ink",
    },
  ];

  return (
    <div>
      <div
        className="flex h-8 w-full overflow-hidden border border-rule-2"
        role="img"
        aria-label={legs
          .map((leg) => `${leg.label} ${bpsToPercent(leg.bps)} of the fee`)
          .join(", ")}
      >
        {legs.map((leg) => (
          <div
            key={leg.key}
            className={leg.bar}
            style={{ width: `${(leg.bps / BPS) * 100}%` }}
          />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-px bg-rule-2 sm:grid-cols-3">
        {legs.map((leg) => (
          <div key={leg.key} className="bg-steel-2 px-3 py-3">
            <dt className="flex items-center gap-2">
              <span aria-hidden className={`lamp ${leg.bar}`} />
              <span className="label">{leg.label}</span>
            </dt>
            <dd className={`mono num mt-2 text-[20px] leading-none ${leg.text}`}>
              {bpsToPercent(leg.bps)}
            </dd>
            <dd className="mt-2 text-[11px] leading-snug text-ink-faint">
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
