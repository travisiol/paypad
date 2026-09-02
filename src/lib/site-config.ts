/**
 * The whole brand lives in the two strings at the top of `siteConfig`
 * (`name`, `wordmark`) plus the `NEXT_PUBLIC_PAYPAD_*` env prefix. Nothing
 * else in the codebase spells the name out, so a rename is those two strings
 * and the prefix — never a grep-and-replace through components.
 */
export const siteConfig = {
  // Placeholder name — RDAP on 2026-09-02 found paypad.com, .xyz, .app, .fun
  // and .io all registered; paypad.trade was free.
  name: "PAYPAD",
  wordmark: "PayPad",

  tagline: "LAUNCH A TOKEN THAT PAYS ITS HOLDERS IN STOCK.",
  description:
    "A launchpad for pay-in-kind tokens on Robinhood Chain. Pick a tokenized equity, set a trading fee, deploy. Every trade routes fees into buying that asset and distributing it to holders.",
  seoDescription:
    "Deploy a token whose trading fees buy a tokenized equity and distribute it to holders. Pick the payout asset, set the fee, launch.",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://paypad.example",
  x: "https://x.com/paypad_onchain",
} as const;

/** Treats both "unset" and "" the same way: not configured yet. */
export function envOrNull(value: string | undefined): string | null {
  return value && value.trim().length > 0 ? value : null;
}

/**
 * Launch surface. Every address here is env-driven and unset by default: an
 * address that isn't real must never be able to reach a build, because on a
 * launchpad a wrong factory address does not show a wrong number — it takes
 * a deployment transaction and the fees that follow it.
 *
 * `isLive` is the single switch the rest of the app reads. It requires the
 * flag AND the factory, because without a factory there is nothing to launch
 * from, and every launch control on the site stays interlocked.
 */
const factoryAddress = envOrNull(process.env.NEXT_PUBLIC_PAYPAD_FACTORY_ADDRESS);

export const launchConfig = {
  isLive:
    process.env.NEXT_PUBLIC_PAYPAD_LIVE === "true" && factoryAddress !== null,
  /** Contract that deploys pads and hard-codes the fee split into each one. */
  factoryAddress,
  /** Where the protocol's share of collected fees accrues. */
  treasuryAddress: envOrNull(process.env.NEXT_PUBLIC_PAYPAD_TREASURY_ADDRESS),
  /** Block the factory was deployed in — the floor for any log scan. */
  deploymentBlock: envOrNull(process.env.NEXT_PUBLIC_PAYPAD_DEPLOYMENT_BLOCK),
  /** Published audit of the factory + pad template, once one exists. */
  auditUrl: envOrNull(process.env.NEXT_PUBLIC_PAYPAD_AUDIT_URL),
  /** Verified source for the pad template, once it is verified. */
  sourceUrl: envOrNull(process.env.NEXT_PUBLIC_PAYPAD_SOURCE_URL),
} as const;

export const explorer = {
  base:
    process.env.NEXT_PUBLIC_ROBINHOOD_EXPLORER_URL ??
    "https://robinhoodchain.blockscout.com",
  address(addr: string) {
    return `${this.base}/address/${addr}`;
  },
  tx(hash: string) {
    return `${this.base}/tx/${hash}`;
  },
} as const;
