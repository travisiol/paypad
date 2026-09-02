"use client";

import { useBlockNumber, useGasPrice } from "wagmi";
import { formatUnits } from "viem";
import { useNowSeconds } from "@/lib/clock";
import { robinhoodChain } from "@/lib/chain";
import { Chip } from "./ui/Chip";

/**
 * A live readout of the chain this launchpad targets, read by the visitor's
 * own browser.
 *
 * It sits directly above the project's own counters, which are all zero. That
 * juxtaposition is the point: the chain is real and answering right now, the
 * launchpad on top of it is not deployed, and the page shows both rather than
 * borrowing the credibility of the one for the other.
 */
export function ChainReadout() {
  const now = useNowSeconds();

  const { data: blockNumber, dataUpdatedAt: blockAt, isError: blockError } =
    useBlockNumber({ query: { refetchInterval: 6_000 } });
  const { data: gasPrice } = useGasPrice({ query: { refetchInterval: 6_000 } });

  const connected = blockNumber !== undefined;
  // "last read", not "last block": Robinhood Chain produces blocks several
  // times a second, so what is a few seconds old is the read, not the block.
  const age =
    blockAt && now > 0 ? Math.max(0, now - Math.floor(blockAt / 1000)) : null;

  const rows: { label: string; value: string | null }[] = [
    { label: "Chain", value: `${robinhoodChain.name} · ${robinhoodChain.id}` },
    {
      label: "Block height",
      value: blockNumber !== undefined ? blockNumber.toLocaleString("en-US") : null,
    },
    {
      label: "Gas price",
      value:
        gasPrice !== undefined
          ? `${Number(formatUnits(gasPrice, 9)).toFixed(4)} gwei`
          : null,
    },
    {
      label: "Last read",
      value: age === null ? null : age === 0 ? "just now" : `${age}s ago`,
    },
  ];

  return (
    <div className="rig bolted">
      <div className="rig-head">
        <span>RPC · live</span>
        {blockError ? (
          <Chip tone="halt" lamp>
            No answer
          </Chip>
        ) : connected ? (
          <Chip tone="panel" lamp>
            Answering
          </Chip>
        ) : (
          <Chip tone="panel">Reading…</Chip>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-px bg-panel-rule sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="bg-panel px-4 py-4">
            <dt className="label label-on-panel">{row.label}</dt>
            <dd className="mono num mt-2 text-[13px] text-panel-ink">
              {row.value ?? <span className="text-panel-faint">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
