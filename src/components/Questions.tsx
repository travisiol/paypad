import { bpsToPercent, feeBounds, splitTerms, maxCreatorShareBps } from "@/lib/economics";
import { siteConfig } from "@/lib/site-config";

/**
 * Ten questions, in <details> so they work with JavaScript switched off, and
 * ordered worst-first. A launchpad asks strangers to point their fees at a
 * contract it wrote; the questions that make it look bad are the ones that
 * deserve to be answered before the flattering ones.
 */
const questions: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is any of this deployed?",
    a: (
      <>
        No. There is no factory, no pad template, no audit, and no pad. Every
        control on this site that would spend money is interlocked, and the
        interlock panel names the reason. The chain readout is live because the
        chain is live; the project on top of it is not.
      </>
    ),
  },
  {
    q: `What does ${siteConfig.wordmark} take?`,
    a: (
      <>
        {bpsToPercent(splitTerms.platformShareBps)} of every fee every pad ever
        collects, and nothing else. Launching is free beyond gas. There is no
        listing fee, no token sale, and no allocation of your supply — the
        protocol never holds a share of your token, only a share of the fees it
        produces. If your pad never trades, this site earns nothing from it.
      </>
    ),
  },
  {
    q: "Paying holders in tokenized equities — is that legal?",
    a: (
      <>
        That is the open question, and it is not one a launchpad can answer for
        you. Distributing an asset that represents equity exposure looks a great
        deal like distributing a security, and in most jurisdictions that is a
        regulated activity with a named responsible party. The protocol is
        neutral plumbing; the person who deploys a pad and points it at an asset
        is the one making that decision. Take advice before you launch, not
        after.
      </>
    ),
  },
  {
    q: "Which assets can a pad pay in?",
    a: (
      <>
        Any ERC-20 on the same chain — and right now, that is the honest limit of
        the claim. The registry on this site is empty: nothing has been verified
        as a natively issued tokenized equity on Robinhood Chain, so nothing is
        listed. Station 02 publishes the standard an asset has to meet before it
        gets listed, and lets you point a pad at an address it has not checked,
        clearly labelled as unchecked.
      </>
    ),
  },
  {
    q: "What stops the creator of a pad from rugging its holders?",
    a: (
      <>
        The fee, the split and the supply are fixed at deploy and the pad has no
        function to change them, so nobody can quietly raise the fee, redirect
        the payout, or mint more supply — including the creator, and including
        this protocol. What that does <em>not</em> prevent: a creator who holds
        most of the supply can sell it, liquidity can be pulled, and the payout
        asset itself can fail. An immutable split is not a promise about
        anyone&rsquo;s behaviour.
      </>
    ),
  },
  {
    q: "Why do holders have to claim instead of being paid automatically?",
    a: (
      <>
        Because a contract cannot iterate its holders. Pushing a payout to
        thousands of addresses costs more gas than the payout delivers, and it
        gets worse as a pad succeeds. So a pad accrues per-holder and each holder
        claims when it is worth the gas to them. It is the less flattering
        design, and it is the only one that survives contact with a real holder
        count.
      </>
    ),
  },
  {
    q: "What happens if the payout asset is illiquid?",
    a: (
      <>
        The swap moves the price against your own holders, or fails outright and
        the fees sit uninvested. This is the failure mode nobody advertises: a
        pad is only as good as the market for the thing it buys. Depth against
        ETH is in the asset standard for exactly this reason, and it is the item
        most likely to disqualify an asset people would otherwise want.
      </>
    ),
  },
  {
    q: "Can the protocol's cut change after I launch?",
    a: (
      <>
        Not on your pad. The split is burned into each pad at deploy and the
        factory has no path back into a deployed one. A future factory could set
        different terms — that would apply to pads launched from it, never to
        yours. Anyone can check this by reading the numbers off your pad rather
        than off this page.
      </>
    ),
  },
  {
    q: "Who has audited the contracts?",
    a: (
      <>
        Nobody. They are not written. When they are, the audit and the verified
        source will be linked from the verification block on this page, and until
        those links exist, assume the code has been read by exactly one person.
      </>
    ),
  },
  {
    q: "Why should I believe the numbers on this page?",
    a: (
      <>
        You should not — you should read them from the contract. The factory
        exposes its platform share and its holder floor as public functions for
        that reason, so a wallet or a block explorer can print the terms without
        this website in the loop. Terms printed by a front end are marketing.
        Terms a contract will hand you are terms. Fee bounds today read{" "}
        {bpsToPercent(feeBounds.minTradeFeeBps)}–
        {bpsToPercent(feeBounds.maxTradeFeeBps)}, holder floor{" "}
        {bpsToPercent(splitTerms.minHolderShareBps)}, creator ceiling{" "}
        {bpsToPercent(maxCreatorShareBps)} — check them against the factory the
        day one exists.
      </>
    ),
  },
];

export function Questions() {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {questions.map((item, index) => (
        <details key={item.q} className="qa">
          <summary>
            <span className="mono text-[11px] text-ink-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="display text-[16px] tracking-[-0.02em] sm:text-[18px]">
              {item.q}
            </span>
          </summary>
          <p className="max-w-3xl pb-6 pl-9 text-[14px] leading-relaxed text-ink-dim">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
