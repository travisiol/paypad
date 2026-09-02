/**
 * The interface this site is written against.
 *
 * No contract implements it yet. It is published anyway, and early, because
 * it is the part of the design that has to be agreed before anything is
 * deployed: the factory hard-codes the split, the pad holds the accounting,
 * and both are readable by anyone without trusting this front end.
 *
 * Two design points are load-bearing and visible in the shape below:
 *
 *   1. `platformShareBps` and `minHolderShareBps` are *read from the factory*,
 *      not from this bundle. Terms printed by a website are marketing; terms a
 *      wallet can read out of a contract are terms. Once a factory exists,
 *      every number on this site is checkable against it.
 *   2. Distribution is pull, not push. `claim()` per holder is the only design
 *      that survives a launchpad: a pad cannot iterate its holder set, and
 *      pushing to thousands of addresses would spend more gas than the payout
 *      it delivers. Holders accrue; they claim when it is worth the gas.
 */
export const padFactoryAbi = [
  {
    type: "function",
    name: "createPad",
    stateMutability: "payable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "supply", type: "uint256" },
      { name: "payoutAsset", type: "address" },
      { name: "tradeFeeBps", type: "uint16" },
      { name: "creatorShareBps", type: "uint16" },
      { name: "creatorTreasury", type: "address" },
    ],
    outputs: [{ name: "pad", type: "address" }],
  },
  {
    type: "function",
    name: "padCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "padAt",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "platformShareBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "function",
    name: "minHolderShareBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "function",
    name: "treasury",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "PadCreated",
    inputs: [
      { name: "pad", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "payoutAsset", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
      { name: "tradeFeeBps", type: "uint16", indexed: false },
      { name: "creatorShareBps", type: "uint16", indexed: false },
    ],
  },
] as const;

export const padAbi = [
  {
    type: "function",
    name: "payoutAsset",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "tradeFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "function",
    name: "creatorShareBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "function",
    name: "totalDistributed",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "claimable",
    stateMutability: "view",
    inputs: [{ name: "holder", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    type: "event",
    name: "Distributed",
    inputs: [
      { name: "feeIn", type: "uint256", indexed: false },
      { name: "payoutOut", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Claimed",
    inputs: [
      { name: "holder", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
