import {
  BPS,
  bpsToPercent,
  formatScaled,
  percentOfTrade,
  splitOf,
} from "@/lib/economics";

/**
 * The wiring schematic for one pad.
 *
 * Pipe thickness is computed from the same split the rest of the page prints,
 * so the drawing cannot drift from the numbers — change the creator share and
 * the pipes move. The floor of 5px keeps a small share visible without letting
 * it look bigger than it is; every pipe is labelled with its own figure, so no
 * reading is left to the geometry.
 *
 * Colour and font come from Tailwind classes, not from `var()` in SVG
 * presentation attributes: custom-property substitution in a presentation
 * attribute is not reliable across browsers, and a diagram that loses its
 * colours in one of them is worse than no diagram.
 */
export function RouteDiagram({
  tradeFeeBps,
  creatorShareBps,
  payoutSymbol,
  className,
}: {
  tradeFeeBps: number;
  creatorShareBps: number;
  payoutSymbol?: string | null;
  className?: string;
}) {
  const split = splitOf(creatorShareBps);
  const trunk = 66;
  const gauge = (shareBps: number) =>
    Math.max(5, Math.round((trunk * shareBps) / BPS));

  const asset = payoutSymbol ?? "PAYOUT ASSET";
  const untouched = formatScaled(BPS - tradeFeeBps, 100, 2);

  return (
    <svg
      viewBox="0 0 980 320"
      className={className}
      role="img"
      aria-label={`One trade pays ${bpsToPercent(tradeFeeBps)} in fees. Of that fee, ${bpsToPercent(split.holderShareBps)} buys ${asset} for holders, ${bpsToPercent(split.creatorShareBps)} goes to the creator, and ${bpsToPercent(split.platformShareBps)} goes to the protocol.`}
    >
      <defs>
        <marker
          id="rd-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 Z" className="fill-rule-2" />
        </marker>
      </defs>

      {/* trunk: a trade arrives, the fee is taken off it */}
      <rect
        x="1"
        y="128"
        width="150"
        height="64"
        rx="20"
        className="fill-slate"
      />
      <text
        x="76"
        y="154"
        textAnchor="middle"
        className="mono fill-slate-faint text-[10px] tracking-[0.18em]"
      >
        INPUT
      </text>
      <text
        x="76"
        y="177"
        textAnchor="middle"
        className="mono fill-slate-ink text-[14px]"
      >
        ONE TRADE
      </text>
      <text
        x="76"
        y="216"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px]"
      >
        {untouched}% untouched
      </text>

      <line
        x1="153"
        y1="160"
        x2="236"
        y2="160"
        className="stroke-rule-2"
        markerEnd="url(#rd-arrow)"
      />
      <text
        x="194"
        y="150"
        textAnchor="middle"
        className="mono fill-lime-deep text-[11px]"
      >
        {bpsToPercent(tradeFeeBps)}
      </text>
      <text
        x="194"
        y="180"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px] tracking-[0.14em]"
      >
        FEE
      </text>

      {/* the splitter: shares are burned in at deploy and never move again */}
      <rect
        x="240"
        y="112"
        width="112"
        height="96"
        rx="26"
        className="fill-slate"
      />
      <text
        x="296"
        y="142"
        textAnchor="middle"
        className="mono fill-slate-faint text-[10px] tracking-[0.18em]"
      >
        SPLIT
      </text>
      <text
        x="296"
        y="168"
        textAnchor="middle"
        className="mono fill-slate-ink text-[12px]"
      >
        FIXED AT
      </text>
      <text
        x="296"
        y="188"
        textAnchor="middle"
        className="mono fill-slate-ink text-[12px]"
      >
        DEPLOY
      </text>

      {/* holders' leg: buy the payout asset, then accrue to holders */}
      <path
        d="M352 148 H430 V60 H520"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={gauge(split.holderShareBps)}
        className="stroke-lime"
      />
      <rect
        x="520"
        y="30"
        width="150"
        height="60"
        rx="20"
        className="fill-white/80 stroke-rule-2"
      />
      <text
        x="595"
        y="54"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px] tracking-[0.18em]"
      >
        BUY
      </text>
      <text
        x="595"
        y="76"
        textAnchor="middle"
        className="mono fill-ink text-[13px]"
      >
        {asset}
      </text>
      <line
        x1="672"
        y1="60"
        x2="798"
        y2="60"
        className="stroke-rule-2"
        markerEnd="url(#rd-arrow)"
      />
      <rect
        x="802"
        y="24"
        width="176"
        height="76"
        rx="22"
        className="fill-lime-pale stroke-lime-deep/25"
      />
      <text
        x="890"
        y="46"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px] tracking-[0.14em]"
      >
        HOLDERS · CLAIMABLE
      </text>
      <text
        x="890"
        y="72"
        textAnchor="middle"
        className="mono fill-lime-deep text-[16px]"
      >
        {bpsToPercent(split.holderShareBps)}
      </text>
      <text
        x="890"
        y="90"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px]"
      >
        {percentOfTrade(tradeFeeBps, split.holderShareBps)}% of the trade
      </text>

      {/* creator's leg */}
      <path
        d="M352 160 H802"
        fill="none"
        strokeLinecap="round"
        strokeWidth={gauge(split.creatorShareBps)}
        className="stroke-chrome-3"
      />
      <rect
        x="802"
        y="128"
        width="176"
        height="64"
        rx="20"
        className="fill-white/80 stroke-rule-2"
      />
      <text
        x="890"
        y="150"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px] tracking-[0.18em]"
      >
        CREATOR
      </text>
      <text
        x="890"
        y="172"
        textAnchor="middle"
        className="mono fill-ink text-[16px]"
      >
        {bpsToPercent(split.creatorShareBps)}
      </text>
      <text
        x="890"
        y="187"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px]"
      >
        {percentOfTrade(tradeFeeBps, split.creatorShareBps)}% of the trade
      </text>

      {/* the protocol's leg — this site's entire revenue, drawn to scale */}
      <path
        d="M352 172 H430 V262 H802"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={gauge(split.platformShareBps)}
        className="stroke-slate"
      />
      <rect
        x="802"
        y="230"
        width="176"
        height="66"
        rx="20"
        className="fill-slate"
      />
      <text
        x="890"
        y="252"
        textAnchor="middle"
        className="mono fill-slate-faint text-[9px] tracking-[0.18em]"
      >
        PROTOCOL
      </text>
      <text
        x="890"
        y="274"
        textAnchor="middle"
        className="mono fill-slate-ink text-[16px]"
      >
        {bpsToPercent(split.platformShareBps)}
      </text>
      <text
        x="890"
        y="290"
        textAnchor="middle"
        className="mono fill-slate-faint text-[9px]"
      >
        {percentOfTrade(tradeFeeBps, split.platformShareBps)}% of the trade
      </text>
    </svg>
  );
}
