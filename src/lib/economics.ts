/**
 * The fee model, in one file.
 *
 * These are *proposed terms*, not observed behaviour: no factory is deployed,
 * so nothing here is enforced by any contract yet. The site says so wherever
 * it prints them. What they are not is invented decoration — they are the
 * numbers the factory is meant to hard-code, and the arithmetic below is the
 * arithmetic the pad is meant to perform, integer-for-integer.
 *
 * Two revenue lines were considered for the protocol and only one was kept:
 *
 *   - a one-off launch fee — dropped, set to zero. A launchpad's growth lever
 *     is that launching costs nothing but gas; charging at the door taxes the
 *     exact moment with the least information about whether the pad will work.
 *   - a share of every fee the pad ever collects — kept. It only pays when the
 *     pad pays, which is the alignment worth having.
 */

/** Basis points in a whole. */
export const BPS = 10_000;

/**
 * Takes the *value*, never the variable name: Next only inlines
 * `process.env.NEXT_PUBLIC_FOO` into the client bundle on static member
 * access, so `process.env[name]` reads undefined in the browser and every
 * override below would silently fall back to its default.
 */
function envBps(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

/**
 * Bounds on the trading fee a creator may set on their own pad.
 *
 * The floor exists because a fee below it cannot cover the gas of a swap and
 * a distribution — the pad would collect dust and spend more moving it. The
 * ceiling exists because above it the token is a fee, not a market.
 */
export const feeBounds = {
  minTradeFeeBps: envBps(
    process.env.NEXT_PUBLIC_PAYPAD_MIN_FEE_BPS,
    25,
    1,
    10_000,
  ),
  maxTradeFeeBps: envBps(
    process.env.NEXT_PUBLIC_PAYPAD_MAX_FEE_BPS,
    500,
    1,
    10_000,
  ),
  defaultTradeFeeBps: envBps(
    process.env.NEXT_PUBLIC_PAYPAD_DEFAULT_FEE_BPS,
    150,
    1,
    10_000,
  ),
} as const;

/**
 * How a collected fee splits three ways. These are shares *of the fee*, not
 * of the trade.
 *
 * The holder floor is the product definition: a pad that routes less than
 * this to buying the payout asset is not a pay-in-kind token, it is a fee
 * with a story attached, and the factory refuses to deploy it.
 */
export const splitTerms = {
  /** The protocol's share of every fee every pad ever collects. */
  platformShareBps: envBps(
    process.env.NEXT_PUBLIC_PAYPAD_PLATFORM_SHARE_BPS,
    1_000,
    0,
    4_000,
  ),
  /** Hard floor on the share that buys the payout asset for holders. */
  minHolderShareBps: envBps(
    process.env.NEXT_PUBLIC_PAYPAD_MIN_HOLDER_SHARE_BPS,
    6_000,
    0,
    10_000,
  ),
  /** Cost to deploy a pad, on top of gas. Zero, on purpose. */
  launchFeeWei: 0n,
} as const;

/** The most a creator can route to their own treasury, by construction. */
export const maxCreatorShareBps = Math.max(
  0,
  BPS - splitTerms.platformShareBps - splitTerms.minHolderShareBps,
);

export const defaultCreatorShareBps = Math.min(2_000, maxCreatorShareBps);

export type FeeSplit = {
  /** Shares of the collected fee. */
  holderShareBps: number;
  creatorShareBps: number;
  platformShareBps: number;
};

/**
 * Split a fee three ways. The creator only chooses their own share; the
 * protocol share is fixed and the holders take the rest, so the holder share
 * can never silently fall below the floor — an out-of-range creator share is
 * clamped rather than honoured.
 */
export function splitOf(creatorShareBps: number): FeeSplit {
  const creator = clamp(creatorShareBps, 0, maxCreatorShareBps);
  return {
    creatorShareBps: creator,
    platformShareBps: splitTerms.platformShareBps,
    holderShareBps: BPS - creator - splitTerms.platformShareBps,
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * A share of the fee, expressed as a share of the trade it was taken from.
 *
 * Kept in integers end to end: `tradeFeeBps * shareBps` is in units of 1e-8
 * of the trade, so the percentage is that product over 1e6. Floats would put
 * 0.10500000000000001% on a page whose whole argument is that its numbers are
 * exact.
 */
export function percentOfTrade(tradeFeeBps: number, shareBps: number) {
  return formatScaled(tradeFeeBps * shareBps, 1_000_000, 4);
}

/** Basis points as a percentage string: 150 → "1.5%". */
export function bpsToPercent(bps: number) {
  return `${formatScaled(bps, 100, 2)}%`;
}

/**
 * Format `value / divisor` exactly, to at most `maxDecimals` places, with
 * trailing zeros trimmed. Integer arithmetic only.
 */
export function formatScaled(value: number, divisor: number, maxDecimals: number) {
  const whole = Math.trunc(value / divisor);
  const remainder = Math.abs(value % divisor);
  if (remainder === 0) return String(whole);
  const decimals = String(
    Math.round((remainder / divisor) * 10 ** maxDecimals),
  ).padStart(maxDecimals, "0");
  const trimmed = decimals.replace(/0+$/, "");
  return trimmed.length > 0 ? `${whole}.${trimmed}` : String(whole);
}

export type FeeAmounts = {
  /** Total fee taken out of the volume. */
  fee: bigint;
  toHolders: bigint;
  toCreator: bigint;
  toPlatform: bigint;
};

/**
 * The arithmetic a pad performs, mirrored exactly — including where the dust
 * goes. The protocol and creator legs round down and holders take the
 * remainder, so no rounding path exists in which the protocol earns a wei the
 * holders paid for.
 */
export function feeAmounts(
  volume: bigint,
  tradeFeeBps: number,
  creatorShareBps: number,
): FeeAmounts {
  const split = splitOf(creatorShareBps);
  const fee = (volume * BigInt(tradeFeeBps)) / BigInt(BPS);
  const toPlatform = (fee * BigInt(split.platformShareBps)) / BigInt(BPS);
  const toCreator = (fee * BigInt(split.creatorShareBps)) / BigInt(BPS);
  return { fee, toPlatform, toCreator, toHolders: fee - toPlatform - toCreator };
}
