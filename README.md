# PAYPAD

A launchpad for pay-in-kind tokens on Robinhood Chain. Anyone deploys a token
whose trading fees buy a tokenized equity and hand it to the people holding the
token. The creator picks the asset, sets the fee, and sets their own share; the
protocol takes a fixed share of every fee collected, and nothing else.

It is the [GOLDR / STOCKR / HOODR] mechanic turned into infrastructure: instead
of one token paying one asset, a factory stamps out as many as people want, and
the launchpad's revenue is a slice of every fee those tokens ever produce.

**Nothing is deployed.** There is no factory, no pad template, no audit, and no
pad. The site is built so that fact cannot be hidden by the interface.

---

## Status

| Thing | State |
| --- | --- |
| Factory contract | not written |
| Pad template contract | not written |
| Audit | not commissioned |
| Payout asset registry | empty — nothing verified |
| Front end | complete, wired, and interlocked |
| Chain | live — RPC probed 2026-09-02, chain id 4663 (`0x1237`) |

## The model

Two revenue lines were considered and only one kept:

- **Launch fee — zero.** A launchpad's growth lever is that launching costs
  nothing but gas. Charging at the door taxes the exact moment with the least
  information about whether a pad will work.
- **A share of every fee — kept.** `10%` of every fee every pad ever collects.
  It only pays when the pad pays.

The creator sets a trading fee between `0.25%` and `5%`, and their own share of
that fee up to `30%`. The protocol takes `10%`. Holders get the remainder, which
is why the holder share can never fall below `60%` — it is a remainder, not a
promise. Every one of those numbers lives in `src/lib/economics.ts`, is
overridable by env, and must match whatever a deployed factory actually
enforces. The factory is the source of truth; the front end is a copy.

Rounding is integer end to end and mirrors what the contract should do: the
protocol and creator legs round down, holders take the dust. There is no
rounding path where the protocol earns a wei the holders paid for.

## Design decisions already made

- **Distribution is pull, not push.** A pad cannot iterate its holders, and
  pushing to thousands of addresses costs more gas than it delivers. Holders
  accrue and claim. This is the less flattering design and the only one that
  survives a real holder count.
- **A pad is immutable.** Supply, fee, split and payout asset are written at
  deploy with no setters, no admin key and no proxy. A future factory can set
  different terms for future pads; it can never reach into a deployed one.
- **The terms are readable from the factory.** `platformShareBps()` and
  `minHolderShareBps()` are public so a wallet or explorer can print the terms
  without this website in the loop.
- **The registry is empty until an asset is verified.** A pad buys whatever
  contract it is handed. `src/lib/payout-assets.ts` publishes the standard an
  asset has to meet and lists nothing until one does.

## Open decisions

None of these is faked anywhere on the site.

1. **The swap venue.** A pad has to trade ETH for the payout asset somewhere.
   No router, pool or aggregator on this chain has been chosen or checked.
2. **Distribution cadence.** Whether fees swap per-trade, per-block, or on a
   keeper's schedule — this is a gas-versus-latency decision that needs real
   numbers from a deployed pad.
3. **Whether the protocol share is taken in ETH or in the payout asset.**
   Taking it pre-swap is simpler; taking it post-swap aligns the protocol with
   the thing it is selling.
4. **The pad's own liquidity story.** The factory does not seed a pool. Whether
   it should, and with what, is undecided.
5. **The regulatory read.** Paying holders in tokenized equities distributes
   securities exposure. This needs a compliance pass before any factory is
   deployed, and the answer may well be "not in this jurisdiction".
6. **Whether the registry should be permissionless.** Anyone can point a pad at
   any address today. A curated list is safer for users and a chokepoint the
   protocol may not want to own.

## Unverified premise

The same one [STOCKR] and [HOODR] carry: that tokenized equities are actually
issued natively on Robinhood Chain. It could not be checked from here, so the
site never asserts it. Station 02 publishes it as the standard an asset must
meet, the registry stays empty, and the launcher lets you supply an address
while saying plainly that nothing has checked it.

## Legal notes, written here rather than moralised on the page

- Distributing an asset that represents equity exposure looks like distributing
  a security. The protocol is neutral plumbing; the person who deploys a pad and
  points it at an asset is the responsible party. This is stated in the FAQ as
  question 3, before any flattering question.
- "Tokenized equity" is a claim on an issuer, not a share held through a broker.
  A pad's payout is exposure to that claim.
- No affiliation with Robinhood Markets, Inc. is claimed or implied.

## Architecture

```
src/lib/economics.ts      the fee model — bounds, split, integer arithmetic
src/lib/launch-plan.ts    draft validation, the interlock chain, the exact call
src/lib/paypadAbi.ts      the interface the factory and pads must implement
src/lib/payout-assets.ts  the payout registry and the standard for listing
src/lib/draft-storage.ts  the launch draft, in this browser only
src/lib/site-config.ts    the brand (two strings) and the launch surface
```

The interlock chain in `launch-plan.ts` is the load-bearing idea: nine
conditions, each stating what must be true and what is actually the case. The
console renders them; it does not decide them. The same function backs the
control on `/launch`, so the button and the panel can never disagree.

## Running it

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local`. Everything is unset by default and the site
is correct in that state — that is the point. `NEXT_PUBLIC_PAYPAD_LIVE=true`
alone does nothing: `isLive` also needs a factory address, because without a
factory there is nothing to launch from.

## Notes to whoever picks this up

- **The name is a placeholder.** RDAP on 2026-09-02: `paypad.com`, `.xyz`,
  `.app`, `.fun` and `.io` are all registered; `paypad.trade` was free. The name
  lives in two strings in `src/lib/site-config.ts` plus the
  `NEXT_PUBLIC_PAYPAD_*` env prefix — a rename is those, never a
  grep-and-replace through components.
- **`tsconfig` targets ES2020**, not the ES2017 the Next template ships. The fee
  arithmetic uses BigInt literals and TypeScript refuses them below ES2020.
  Deleting `tsconfig.tsbuildinfo` is required for that change to take effect.
- **Shared data crossing the server/client boundary lives in `src/lib/nav.ts`**
  with no `"use client"` directive. Exports of a client module become client
  references when a server component imports them, and a server footer importing
  the nav array from a client navbar gets a proxy, not an array.
- **`process.env` is read by static member access only.** `process.env[name]`
  is not inlined into the client bundle, so every env override would silently
  fall back to its default.
- **Scroll reveal is CSS-only** (`animation-timeline: view()` under
  `@supports`), with a `@media print` escape hatch — renderers that evaluate a
  scroll timeline at progress zero would otherwise paint every section at
  opacity 0.
