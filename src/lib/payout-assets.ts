import { isAddress, getAddress } from "viem";

/**
 * The payout registry: tokenized equities a pad may be pointed at.
 *
 * It is EMPTY by default, and that is the honest state. A pad buys whatever
 * contract it is handed, so a wrong address here does not misprint a page —
 * it routes real fees into a contract nobody chose. Nothing gets listed until
 * someone has checked it against the standard in `assetStandard` below.
 *
 * Populate with NEXT_PUBLIC_PAYPAD_PAYOUT_ASSETS, one asset per comma:
 *
 *   SPY:S&P 500:0xabc…,NVDA:NVIDIA:0xdef…
 *
 * A malformed entry is dropped rather than guessed at.
 */
export type PayoutAsset = {
  symbol: string;
  name: string;
  address: `0x${string}`;
};

export const assetStandard = [
  "Issued natively on Robinhood Chain — a pad cannot bridge, and will not try.",
  "ERC-20 transferable to any address, with no whitelist or transfer hook that can fail on a holder.",
  "A named issuer, and a published redemption path from the token back to the underlying.",
  "Enough onchain liquidity against ETH that a fee-sized buy does not move the price it is buying at.",
] as const;

function parseRegistry(raw: string | undefined): PayoutAsset[] {
  if (!raw) return [];
  const assets: PayoutAsset[] = [];
  for (const entry of raw.split(",")) {
    const parts = entry.split(":").map((part) => part.trim());
    if (parts.length !== 3) continue;
    const [symbol, name, address] = parts;
    if (!symbol || !name || !isAddress(address)) continue;
    assets.push({ symbol, name, address: getAddress(address) });
  }
  return assets;
}

export const payoutAssets = parseRegistry(
  process.env.NEXT_PUBLIC_PAYPAD_PAYOUT_ASSETS,
);

export const registryIsEmpty = payoutAssets.length === 0;

export function findAsset(address: string | null): PayoutAsset | undefined {
  if (!address) return undefined;
  const lower = address.toLowerCase();
  return payoutAssets.find((asset) => asset.address.toLowerCase() === lower);
}

/** EIP-55 checksum if it parses, null if it is not an address at all. */
export function normalizeAddress(value: string): `0x${string}` | null {
  const trimmed = value.trim();
  return isAddress(trimmed) ? getAddress(trimmed) : null;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
