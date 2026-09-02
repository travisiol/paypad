import { parseUnits, zeroAddress } from "viem";
import {
  BPS,
  bpsToPercent,
  feeBounds,
  maxCreatorShareBps,
  defaultCreatorShareBps,
  splitOf,
  splitTerms,
} from "./economics";
import { normalizeAddress } from "./payout-assets";

/**
 * Everything the launcher knows, and everything that has to be true before it
 * will fire — kept out of the components on purpose. The console renders this;
 * it does not decide it. Same function drives the preview on the home page,
 * so the two can never disagree about what is blocking a launch.
 */

export const limits = {
  nameMax: 32,
  symbolMin: 2,
  symbolMax: 10,
  /** Token decimals are fixed at 18 by the pad template. */
  decimals: 18,
  supplyMin: 1n,
  supplyMax: 1_000_000_000_000n,
} as const;

export type LaunchDraft = {
  name: string;
  symbol: string;
  supply: string;
  payoutAddress: string;
  tradeFeeBps: number;
  creatorShareBps: number;
  /** Empty means "the wallet that signs the deployment". */
  treasury: string;
};

export const emptyDraft: LaunchDraft = {
  name: "",
  symbol: "",
  supply: "",
  payoutAddress: "",
  tradeFeeBps: feeBounds.defaultTradeFeeBps,
  creatorShareBps: defaultCreatorShareBps,
  treasury: "",
};

/** Uppercase, letters and digits only — what a ticker can actually be. */
export function normalizeSymbol(raw: string) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, limits.symbolMax);
}

/**
 * Supply as a whole number of tokens. Grouping characters a person would
 * type are accepted; a decimal point is not, because a fractional total
 * supply is a rounding argument nobody wants to have with a contract.
 */
export function parseSupply(raw: string): bigint | null {
  const cleaned = raw.replace(/[\s,_]/g, "");
  if (cleaned.length === 0 || !/^\d+$/.test(cleaned)) return null;
  const value = BigInt(cleaned);
  if (value < limits.supplyMin || value > limits.supplyMax) return null;
  return value;
}

export function formatSupply(value: bigint) {
  return value.toLocaleString("en-US");
}

export type LaunchContext = {
  factoryAddress: string | null;
  isLive: boolean;
  walletAddress?: string;
  chainId?: number;
  expectedChainId: number;
  registryHasAssets: boolean;
};

export type Interlock = {
  id: string;
  label: string;
  /** What has to be true. Stated in the present tense, always. */
  requirement: string;
  /** What is actually the case right now. */
  status: string;
  closed: boolean;
};

/**
 * The interlock panel.
 *
 * A launchpad is a machine, and this is the machine's safety chain: every
 * link has to close before the control arms. Pre-launch the first link cannot
 * close at all — no factory is deployed — and the panel says exactly that
 * rather than letting a button look pressable.
 */
export function interlocksFor(
  draft: LaunchDraft,
  ctx: LaunchContext,
): Interlock[] {
  const supply = parseSupply(draft.supply);
  const payout = normalizeAddress(draft.payoutAddress);
  const treasury =
    draft.treasury.trim().length === 0 ? null : normalizeAddress(draft.treasury);
  const treasuryProvided = draft.treasury.trim().length > 0;
  const name = draft.name.trim();
  const symbol = normalizeSymbol(draft.symbol);
  const split = splitOf(draft.creatorShareBps);

  return [
    {
      id: "factory",
      label: "Factory",
      requirement: "A deployed factory contract to launch from",
      status: ctx.factoryAddress
        ? ctx.isLive
          ? "deployed and armed"
          : "address set, launches still held"
        : "awaiting launch",
      closed: ctx.isLive && ctx.factoryAddress !== null,
    },
    {
      id: "wallet",
      label: "Wallet",
      requirement: "A connected wallet to sign the deployment",
      status: ctx.walletAddress ? "connected" : "not connected",
      closed: Boolean(ctx.walletAddress),
    },
    {
      id: "network",
      label: "Network",
      requirement: "That wallet on Robinhood Chain",
      status: !ctx.walletAddress
        ? "no wallet"
        : ctx.chainId === ctx.expectedChainId
          ? `chain ${ctx.expectedChainId}`
          : `chain ${ctx.chainId ?? "unknown"} — wrong network`,
      closed: Boolean(ctx.walletAddress) && ctx.chainId === ctx.expectedChainId,
    },
    {
      id: "identity",
      label: "Identity",
      requirement: `A name and a ${limits.symbolMin}–${limits.symbolMax} character ticker`,
      status:
        name.length === 0
          ? "name empty"
          : name.length > limits.nameMax
            ? `name over ${limits.nameMax} characters`
            : symbol.length < limits.symbolMin
              ? "ticker too short"
              : `${name} / ${symbol}`,
      closed:
        name.length > 0 &&
        name.length <= limits.nameMax &&
        symbol.length >= limits.symbolMin,
    },
    {
      id: "supply",
      label: "Supply",
      requirement: `A whole supply between 1 and ${formatSupply(limits.supplyMax)}`,
      status:
        draft.supply.trim().length === 0
          ? "not set"
          : supply === null
            ? "out of range or not a whole number"
            : `${formatSupply(supply)} tokens`,
      closed: supply !== null,
    },
    {
      id: "payout",
      label: "Payout asset",
      requirement: "The contract whose token the fees will buy",
      status:
        draft.payoutAddress.trim().length === 0
          ? ctx.registryHasAssets
            ? "not selected"
            : "registry empty — none verified yet"
          : payout === null
            ? "not a valid address"
            : payout === zeroAddress
              ? "zero address"
              : "address accepted",
      closed: payout !== null && payout !== zeroAddress,
    },
    {
      id: "fee",
      label: "Trading fee",
      requirement: `Between ${bpsToPercent(feeBounds.minTradeFeeBps)} and ${bpsToPercent(feeBounds.maxTradeFeeBps)} of each trade`,
      status: `${bpsToPercent(draft.tradeFeeBps)} of each trade`,
      closed:
        draft.tradeFeeBps >= feeBounds.minTradeFeeBps &&
        draft.tradeFeeBps <= feeBounds.maxTradeFeeBps,
    },
    {
      id: "split",
      label: "Split",
      requirement: `At least ${bpsToPercent(splitTerms.minHolderShareBps)} of the fee to holders`,
      status: `${bpsToPercent(split.holderShareBps)} to holders`,
      closed:
        split.holderShareBps >= splitTerms.minHolderShareBps &&
        draft.creatorShareBps >= 0 &&
        draft.creatorShareBps <= maxCreatorShareBps,
    },
    {
      id: "treasury",
      label: "Creator treasury",
      requirement: "An address for the creator's share of the fee",
      status: treasuryProvided
        ? treasury === null
          ? "not a valid address"
          : "custom address"
        : ctx.walletAddress
          ? "the connected wallet"
          : "defaults to the signing wallet",
      closed: treasuryProvided
        ? treasury !== null && treasury !== zeroAddress
        : true,
    },
  ];
}

export function isArmed(interlocks: Interlock[]) {
  return interlocks.every((interlock) => interlock.closed);
}

export function firstOpen(interlocks: Interlock[]) {
  return interlocks.find((interlock) => !interlock.closed);
}

export type LaunchCall = {
  /** Ordered exactly as `createPad` takes them. */
  args: { name: string; type: string; value: string }[];
  /** Wei sent with the call. Zero: launching costs gas and nothing else. */
  value: bigint;
};

/**
 * The call the console would make, built from the draft.
 *
 * Rendered on the review station so a creator sees the transaction before
 * there is a transaction — including the base-unit supply, which is the one
 * number people get wrong by eighteen zeros.
 */
export function buildCall(draft: LaunchDraft, ctx: LaunchContext): LaunchCall {
  const supply = parseSupply(draft.supply);
  const payout = normalizeAddress(draft.payoutAddress);
  const treasury =
    draft.treasury.trim().length === 0
      ? (ctx.walletAddress ?? null)
      : normalizeAddress(draft.treasury);

  return {
    args: [
      { name: "name", type: "string", value: draft.name.trim() || "—" },
      { name: "symbol", type: "string", value: normalizeSymbol(draft.symbol) || "—" },
      {
        name: "supply",
        type: "uint256",
        value:
          supply === null
            ? "—"
            : parseUnits(supply.toString(), limits.decimals).toString(),
      },
      { name: "payoutAsset", type: "address", value: payout ?? "—" },
      { name: "tradeFeeBps", type: "uint16", value: String(draft.tradeFeeBps) },
      {
        name: "creatorShareBps",
        type: "uint16",
        value: String(splitOf(draft.creatorShareBps).creatorShareBps),
      },
      { name: "creatorTreasury", type: "address", value: treasury ?? "—" },
    ],
    value: splitTerms.launchFeeWei,
  };
}

/** Shares of the fee, as shares of the trade — for the split readout. */
export function tradeShareBps(tradeFeeBps: number, shareBps: number) {
  return (tradeFeeBps * shareBps) / BPS;
}
