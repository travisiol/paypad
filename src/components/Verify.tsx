import { explorer, launchConfig } from "@/lib/site-config";
import { robinhoodChain } from "@/lib/chain";
import { Chip } from "./ui/Chip";
import { GlassHead } from "./ui/Section";

type Row = {
  label: string;
  value: string | null;
  href?: string | null;
  note: string;
};

/**
 * Every operator-supplied fact, in one block, with an em dash where there is
 * no fact. An address that is not real must never render as though it were —
 * on a launchpad a wrong factory address does not misprint a page, it takes a
 * deployment and the fees that follow it.
 */
export function Verify() {
  const rows: Row[] = [
    {
      label: "Chain",
      value: `${robinhoodChain.name} · id ${robinhoodChain.id}`,
      note: "Probed live from the browser in the readout above.",
    },
    {
      label: "Factory",
      value: launchConfig.factoryAddress,
      href: launchConfig.factoryAddress
        ? explorer.address(launchConfig.factoryAddress)
        : null,
      note: "Deploys pads and hard-codes the split into each one.",
    },
    {
      label: "Protocol treasury",
      value: launchConfig.treasuryAddress,
      href: launchConfig.treasuryAddress
        ? explorer.address(launchConfig.treasuryAddress)
        : null,
      note: "Where the protocol's share of collected fees accrues.",
    },
    {
      label: "Pad template source",
      value: launchConfig.sourceUrl,
      href: launchConfig.sourceUrl,
      note: "Verified source for the contract every pad is a copy of.",
    },
    {
      label: "Audit",
      value: launchConfig.auditUrl,
      href: launchConfig.auditUrl,
      note: "None commissioned. Assume the code has been read by one person.",
    },
  ];

  return (
    <div className="glass overflow-hidden">
      <GlassHead
        title="Verification"
        aside={
          launchConfig.isLive ? (
            <Chip tone="live" lamp>
              Armed
            </Chip>
          ) : (
            <Chip tone="held" lamp>
              Awaiting launch
            </Chip>
          )
        }
      />
      <dl className="divide-y divide-rule">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="label pt-0.5">{row.label}</dt>
            <dd>
              {row.value ? (
                row.href ? (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono text-[12px] break-all text-ink underline decoration-rule-2 underline-offset-4 hover:text-lime-deep"
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="mono text-[12px] break-all text-ink">
                    {row.value}
                  </span>
                )
              ) : (
                <span
                  className="mono inline-block min-w-[6rem] border-b border-rule-2 text-ink-faint"
                  title="Not set"
                >
                  —
                </span>
              )}
              <p className="mt-1.5 text-[12px] leading-snug text-ink-faint">
                {row.note}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
