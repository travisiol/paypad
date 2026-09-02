"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { clsx } from "clsx";
import {
  bpsToPercent,
  defaultCreatorShareBps,
  feeAmounts,
  feeBounds,
  maxCreatorShareBps,
} from "@/lib/economics";
import { GlassHead } from "./ui/Section";

/**
 * Arithmetic, not a forecast.
 *
 * The volume field starts empty and stays empty: a pre-filled number would be
 * a projection wearing a calculator's clothes, and this project has no volume
 * to project from. Type a number and it divides it; type nothing and it shows
 * dashes.
 */
export function Estimator() {
  const [volume, setVolume] = useState("");
  const [tradeFeeBps, setTradeFeeBps] = useState(feeBounds.defaultTradeFeeBps);
  const [creatorShareBps, setCreatorShareBps] = useState(defaultCreatorShareBps);

  let parsed: bigint | null = null;
  const trimmed = volume.trim();
  if (trimmed.length > 0) {
    try {
      const value = parseEther(trimmed);
      parsed = value >= 0n ? value : null;
    } catch {
      parsed = null;
    }
  }

  const amounts =
    parsed === null ? null : feeAmounts(parsed, tradeFeeBps, creatorShareBps);

  const rows = [
    { label: "Fee collected", value: amounts?.fee, tone: "text-ink" },
    {
      label: "Buys the payout asset",
      value: amounts?.toHolders,
      tone: "text-lime-deep",
    },
    { label: "To the creator", value: amounts?.toCreator, tone: "text-ink" },
    { label: "To the protocol", value: amounts?.toPlatform, tone: "text-ink" },
  ];

  return (
    <div className="glass overflow-hidden">
      <GlassHead title="Arithmetic" aside={<span>Not a forecast</span>} />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="label">Traded volume (ETH)</span>
            <input
              className={clsx(
                "field mt-2",
                trimmed.length > 0 && parsed === null && "field-invalid",
              )}
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
              placeholder="Type a number"
              inputMode="decimal"
            />
            <span className="mono mt-2 block text-[10px] text-ink-faint">
              {trimmed.length > 0 && parsed === null
                ? "Not a number"
                : "Over any period you like — the split does not depend on time"}
            </span>
          </label>

          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="label">Trading fee</span>
                <span className="mono num text-[13px]">
                  {bpsToPercent(tradeFeeBps)}
                </span>
              </div>
              <input
                type="range"
                className="detent mt-1"
                min={feeBounds.minTradeFeeBps}
                max={feeBounds.maxTradeFeeBps}
                step={5}
                value={tradeFeeBps}
                onChange={(event) => setTradeFeeBps(Number(event.target.value))}
                aria-label="Trading fee in basis points"
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="label">Creator share of the fee</span>
                <span className="mono num text-[13px]">
                  {bpsToPercent(creatorShareBps)}
                </span>
              </div>
              <input
                type="range"
                className="detent mt-1"
                min={0}
                max={maxCreatorShareBps}
                step={100}
                value={creatorShareBps}
                onChange={(event) =>
                  setCreatorShareBps(Number(event.target.value))
                }
                aria-label="Creator share of the fee, in basis points"
              />
            </div>
          </div>
        </div>

        <dl className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-rule bg-white/60 px-4 py-4"
              >
                <dt className="label">{row.label}</dt>
                <dd
                  className={clsx(
                    "mono num mt-2.5 text-[16px] break-all",
                    row.tone,
                  )}
                >
                  {row.value === undefined || row.value === null ? (
                    <span className="text-ink-faint">—</span>
                  ) : (
                    `${trim(formatEther(row.value))} ETH`
                  )}
                </dd>
              </div>
          ))}
        </dl>

        <p className="mt-5 text-[12px] leading-relaxed text-ink-faint">
          Fees are collected in ETH and swapped into the payout asset, so what a
          holder actually receives depends on the price and the depth of that
          asset at the moment of the swap. Nothing here models that, because
          nothing here can.
        </p>
      </div>
    </div>
  );
}

/** formatEther gives 18 decimals; nobody reads 18 decimals. */
function trim(value: string) {
  if (!value.includes(".")) return value;
  const [whole, decimals] = value.split(".");
  const short = decimals.slice(0, 6).replace(/0+$/, "");
  return short.length > 0 ? `${whole}.${short}` : whole;
}
