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
 * the pipes move. The floor of 6px keeps a small share visible without letting
 * it look bigger than it is; every lane is labelled with its own figure, so no
 * reading is left to the geometry.
 *
 * Three things this drawing gets right that an earlier version did not: the
 * pipes leave the splitter cleanly at its edge instead of crossing over it,
 * they curve rather than turning square corners, and the three destination
 * cards are identical objects so the only thing distinguishing them is their
 * number. Colour is doing one job here — naming the lane — not decorating.
 *
 * Colour and font come from Tailwind classes where they can be; the pipe
 * gradients are hex stops because a gradient stop cannot take a utility. Every
 * gradient is `userSpaceOnUse`: under the default `objectBoundingBox` a
 * perfectly straight horizontal or vertical stroke has a zero-height or
 * zero-width box, which the spec says makes the element not render at all.
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
  const trunk = 64;
  const gauge = (shareBps: number) =>
    Math.max(6, Math.round((trunk * shareBps) / BPS));

  const asset = payoutSymbol ?? "PAYOUT ASSET";
  const untouched = formatScaled(BPS - tradeFeeBps, 100, 2);

  const lanes = [
    {
      key: "holders",
      label: "Holders · claimable",
      bps: split.holderShareBps,
      node: { y: 22, h: 90 },
      dot: "fill-[#8fd43a]",
      value: "fill-lime-deep",
    },
    {
      key: "creator",
      label: "Creator",
      bps: split.creatorShareBps,
      node: { y: 142, h: 80 },
      dot: "fill-chrome-4",
      value: "fill-ink",
    },
    {
      key: "protocol",
      label: "Protocol",
      bps: split.platformShareBps,
      node: { y: 252, h: 80 },
      dot: "fill-slate",
      value: "fill-ink",
    },
  ];

  return (
    <svg
      viewBox="0 0 1000 340"
      className={className}
      role="img"
      aria-label={`One trade pays ${bpsToPercent(tradeFeeBps)} in fees and keeps ${untouched}% untouched. Of that fee, ${bpsToPercent(split.holderShareBps)} buys ${asset} for holders, ${bpsToPercent(split.creatorShareBps)} goes to the creator, and ${bpsToPercent(split.platformShareBps)} goes to the protocol.`}
    >
      <defs>
        <marker
          id="rd-tip"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 Z" className="fill-rule-2" />
        </marker>
        {/* Light from above, one horizon for the whole drawing. */}
        <linearGradient
          id="rd-lime"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="340"
        >
          <stop offset="0%" stopColor="#e8fdba" />
          <stop offset="45%" stopColor="#cdf27a" />
          <stop offset="100%" stopColor="#b4e457" />
        </linearGradient>
        <linearGradient
          id="rd-chrome"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="340"
        >
          <stop offset="0%" stopColor="#eef1ef" />
          <stop offset="45%" stopColor="#d2d9d4" />
          <stop offset="100%" stopColor="#b6bfb9" />
        </linearGradient>
        <linearGradient
          id="rd-slate"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="340"
        >
          <stop offset="0%" stopColor="#4b5152" />
          <stop offset="55%" stopColor="#33383a" />
          <stop offset="100%" stopColor="#232627" />
        </linearGradient>
      </defs>

      {/* ---------------------------------------------------- the trade in */}
      <rect x="8" y="137" width="168" height="90" rx="18" className="fill-slate" />
      <text
        x="92"
        y="163"
        textAnchor="middle"
        className="mono fill-slate-faint text-[9px] tracking-[0.18em]"
      >
        INPUT
      </text>
      <text
        x="92"
        y="187"
        textAnchor="middle"
        className="mono fill-slate-ink text-[15px]"
      >
        ONE TRADE
      </text>
      <text
        x="92"
        y="207"
        textAnchor="middle"
        className="mono fill-slate-faint text-[9px]"
      >
        {untouched}% untouched
      </text>

      <line
        x1="180"
        y1="182"
        x2="240"
        y2="182"
        className="stroke-rule-2"
        markerEnd="url(#rd-tip)"
      />
      <text
        x="210"
        y="171"
        textAnchor="middle"
        className="mono fill-lime-deep text-[11px]"
      >
        {bpsToPercent(tradeFeeBps)}
      </text>
      <text
        x="210"
        y="200"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px] tracking-[0.14em]"
      >
        FEE
      </text>

      {/*
        Pipes are drawn BEFORE the splitter so its card paints over their round
        caps. Starting them at the card's exact right edge instead would leave
        a half-stroke bulge sitting on top of it, which read as a mistake.
      */}
      {/* ------------------------------------------------------------ pipes */}
      <path
        d="M368 162 C 424 162, 430 66, 486 66"
        fill="none"
        strokeLinecap="round"
        strokeWidth={gauge(split.holderShareBps)}
        stroke="url(#rd-lime)"
      />
      <path
        d="M368 186 C 480 186, 600 182, 712 182"
        fill="none"
        strokeLinecap="round"
        strokeWidth={gauge(split.creatorShareBps)}
        stroke="url(#rd-chrome)"
      />
      <path
        d="M368 206 C 480 206, 580 292, 712 292"
        fill="none"
        strokeLinecap="round"
        strokeWidth={gauge(split.platformShareBps)}
        stroke="url(#rd-slate)"
      />

      {/* ------------------------------------------------------ the splitter */}
      <rect
        x="244"
        y="138"
        width="124"
        height="88"
        rx="18"
        className="fill-slate"
      />
      <text
        x="306"
        y="163"
        textAnchor="middle"
        className="mono fill-slate-faint text-[9px] tracking-[0.18em]"
      >
        SPLIT
      </text>
      <text
        x="306"
        y="185"
        textAnchor="middle"
        className="mono fill-slate-ink text-[12px]"
      >
        FIXED AT
      </text>
      <text
        x="306"
        y="203"
        textAnchor="middle"
        className="mono fill-slate-ink text-[12px]"
      >
        DEPLOY
      </text>

      {/* --------------------------------------- the buy, on the holder lane */}
      <rect
        x="486"
        y="36"
        width="176"
        height="60"
        rx="16"
        className="fill-white stroke-rule-2"
      />
      <text
        x="574"
        y="59"
        textAnchor="middle"
        className="mono fill-ink-faint text-[9px] tracking-[0.18em]"
      >
        BUY
      </text>
      <text
        x="574"
        y="80"
        textAnchor="middle"
        className="mono fill-ink text-[13px]"
      >
        {asset}
      </text>
      <line
        x1="666"
        y1="66"
        x2="708"
        y2="66"
        className="stroke-rule-2"
        markerEnd="url(#rd-tip)"
      />

      {/* ----------------------------------------------- three destinations */}
      {lanes.map((lane) => {
        const cx = 736;
        const top = lane.node.y;
        return (
          <g key={lane.key}>
            <rect
              x="712"
              y={top}
              width="280"
              height={lane.node.h}
              rx="18"
              className="fill-white stroke-rule-2"
            />
            <circle cx={cx} cy={top + 26} r="3.5" className={lane.dot} />
            <text
              x={cx + 14}
              y={top + 30}
              className="mono fill-ink-faint text-[9px] tracking-[0.16em]"
            >
              {lane.label.toUpperCase()}
            </text>
            <text
              x={cx - 4}
              y={top + 58}
              className={`mono num text-[22px] ${lane.value}`}
            >
              {bpsToPercent(lane.bps)}
            </text>
            <text
              x={cx - 4}
              y={top + lane.node.h - 12}
              className="mono fill-ink-faint text-[9px]"
            >
              {percentOfTrade(tradeFeeBps, lane.bps)}% of the trade
            </text>
          </g>
        );
      })}
    </svg>
  );
}
