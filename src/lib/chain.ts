import { defineChain } from "viem";

/**
 * Robinhood Chain network definition.
 *
 * Chain ID 4663 and the RPC URL below were probed from this machine on
 * 2026-09-02: `eth_chainId` returned `0x1237` (4663) and `eth_blockNumber`
 * answered with a height around 52.6M, so the endpoint is real and reachable.
 * The explorer URL is best-effort from public third-party sources and has NOT
 * been confirmed against docs.robinhood.com/chain — re-verify before pointing
 * any of this at real funds.
 *
 * Robinhood Chain reportedly has no native gas token: gas is paid in ETH, and
 * there is no official Robinhood Chain airdrop token. Treat anything claiming
 * otherwise as suspicious.
 *
 * Every value is overridable by env so a corrected endpoint never needs a
 * code change.
 */
export const ROBINHOOD_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID ?? 4663,
);

const RPC_URL =
  process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ??
  "https://rpc.mainnet.chain.robinhood.com";

const EXPLORER_URL =
  process.env.NEXT_PUBLIC_ROBINHOOD_EXPLORER_URL ??
  "https://robinhoodchain.blockscout.com";

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: EXPLORER_URL,
    },
  },
  testnet: false,
});
