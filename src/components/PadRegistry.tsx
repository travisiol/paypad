"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { bpsToPercent, splitTerms } from "@/lib/economics";
import { padAbi, padFactoryAbi } from "@/lib/paypadAbi";
import { explorer, launchConfig } from "@/lib/site-config";
import { findAsset, shortAddress } from "@/lib/payout-assets";
import { Chip } from "./ui/Chip";
import { SlabHead } from "./ui/Section";

/** Newest first, and bounded — a registry page is not a log scanner. */
const PAGE = 24;

/**
 * Every pad ever launched, read from the factory by the visitor's browser.
 *
 * The list is empty because no factory is deployed, and it is empty *by
 * reading*, not by hard-coding an empty array: the queries below are real and
 * simply disabled until there is an address to point them at. A launchpad's
 * registry is the one page that must never show a number it did not read.
 */
export function PadRegistry() {
  const factory = launchConfig.factoryAddress as `0x${string}` | null;
  const enabled = factory !== null;

  const { data: padCount, isLoading: countLoading } = useReadContract({
    address: factory ?? undefined,
    abi: padFactoryAbi,
    functionName: "padCount",
    query: { enabled },
  });

  const total = padCount ?? 0n;
  const start = total > BigInt(PAGE) ? total - BigInt(PAGE) : 0n;
  const indices: bigint[] = [];
  for (let i = total - 1n; i >= start && i >= 0n; i -= 1n) indices.push(i);

  const { data: addresses } = useReadContracts({
    contracts: indices.map((index) => ({
      address: factory ?? undefined,
      abi: padFactoryAbi,
      functionName: "padAt" as const,
      args: [index] as const,
    })),
    query: { enabled: enabled && indices.length > 0 },
  });

  const pads = (addresses ?? [])
    .map((entry) =>
      entry.status === "success" ? (entry.result as `0x${string}`) : null,
    )
    .filter((value): value is `0x${string}` => value !== null);

  const { data: details } = useReadContracts({
    contracts: pads.flatMap((pad) => [
      { address: pad, abi: padAbi, functionName: "payoutAsset" as const },
      { address: pad, abi: padAbi, functionName: "tradeFeeBps" as const },
      { address: pad, abi: padAbi, functionName: "creatorShareBps" as const },
      { address: pad, abi: padAbi, functionName: "totalDistributed" as const },
    ]),
    query: { enabled: pads.length > 0 },
  });

  if (!enabled) {
    return (
      <div className="slab overflow-hidden">
        <SlabHead
          title="Registry"
          aside={
            <Chip tone="slate" lamp>
              Awaiting launch
            </Chip>
          }
        />
        <div className="px-6 py-14 text-center">
          <p className="mono num text-[72px] leading-none text-slate-ink">0</p>
          <p className="label label-on-slate mt-4">Pads launched</p>
          <p className="mx-auto mt-6 max-w-md text-[13px] leading-relaxed text-slate-dim">
            This table reads the factory contract directly. It is awaiting
            launch, so there is nothing to read yet — the zero above is the
            absence of a contract, not a slow start.
          </p>
          <p className="mono mx-auto mt-4 max-w-md text-[11px] leading-relaxed text-slate-faint">
            When one exists, each row will carry the pad address, its payout
            asset, its fee, its split, and the total it has distributed, all
            read from chain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="slab overflow-hidden">
      <SlabHead
        title="Registry"
        aside={
          <span className="mono num text-slate-ink">
            {countLoading ? "reading…" : `${total.toString()} pads`}
          </span>
        }
      />
      {pads.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="mono num text-[72px] leading-none text-slate-ink">0</p>
          <p className="label label-on-slate mt-4">Pads launched</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-slate-rule">
                {["Pad", "Payout", "Fee", "To holders", "Distributed"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="label label-on-slate px-5 py-3.5 text-left"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pads.map((pad, index) => {
                const base = index * 4;
                const asset = details?.[base]?.result as
                  | `0x${string}`
                  | undefined;
                const feeBps = details?.[base + 1]?.result as number | undefined;
                const creatorBps = details?.[base + 2]?.result as
                  | number
                  | undefined;
                const distributed = details?.[base + 3]?.result as
                  | bigint
                  | undefined;
                const holderBps =
                  creatorBps === undefined
                    ? undefined
                    : 10_000 - creatorBps - splitTerms.platformShareBps;
                const known = findAsset(asset ?? null);

                return (
                  <tr
                    key={pad}
                    className="border-b border-slate-rule last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <a
                        href={explorer.address(pad)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mono text-[12px] text-slate-ink underline"
                      >
                        {shortAddress(pad)}
                      </a>
                    </td>
                    <td className="mono px-5 py-3.5 text-[12px] text-slate-dim">
                      {known ? known.symbol : asset ? shortAddress(asset) : "—"}
                    </td>
                    <td className="mono num px-5 py-3.5 text-[12px] text-slate-dim">
                      {feeBps === undefined ? "—" : bpsToPercent(feeBps)}
                    </td>
                    <td className="mono num px-5 py-3.5 text-[12px] text-[#b7e56a]">
                      {holderBps === undefined ? "—" : bpsToPercent(holderBps)}
                    </td>
                    <td className="mono num px-5 py-3.5 text-[12px] text-slate-dim">
                      {distributed === undefined
                        ? "—"
                        : Number(formatUnits(distributed, 18)).toLocaleString(
                            "en-US",
                            { maximumFractionDigits: 4 },
                          )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
