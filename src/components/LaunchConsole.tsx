"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { parseUnits } from "viem";
import {
  useConnection,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { robinhoodChain } from "@/lib/chain";
import {
  bpsToPercent,
  feeBounds,
  maxCreatorShareBps,
  splitTerms,
  splitOf,
} from "@/lib/economics";
import {
  buildCall,
  firstOpen,
  interlocksFor,
  isArmed,
  limits,
  normalizeSymbol,
  parseSupply,
  type LaunchContext,
} from "@/lib/launch-plan";
import { useDraft } from "@/lib/draft-storage";
import {
  normalizeAddress,
  payoutAssets,
  registryIsEmpty,
  assetStandard,
  shortAddress,
} from "@/lib/payout-assets";
import { padFactoryAbi } from "@/lib/paypadAbi";
import { explorer, launchConfig } from "@/lib/site-config";
import { InterlockPanel } from "./InterlockPanel";
import { SplitBar } from "./SplitBar";
import { WalletConnect } from "./WalletConnect";
import { Chip } from "./ui/Chip";
import { GlassHead } from "./ui/Section";

/**
 * The launcher.
 *
 * It is wired end to end — validation, the exact call, the write path — and it
 * cannot fire, because the first interlock in the chain is a factory contract
 * that does not exist. Everything downstream of that is real code rather than
 * a mock, so the day an address is set the console works without a rewrite,
 * and until then the reason it will not fire is written on the control itself.
 */
export function LaunchConsole() {
  const { draft, update, reset } = useDraft();
  const { address, chainId } = useConnection();
  const [copied, setCopied] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending: isSigning,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isMining, isSuccess: isMined } =
    useWaitForTransactionReceipt({ hash });

  const ctx: LaunchContext = {
    factoryAddress: launchConfig.factoryAddress,
    isLive: launchConfig.isLive,
    walletAddress: address,
    chainId,
    expectedChainId: robinhoodChain.id,
    registryHasAssets: !registryIsEmpty,
  };

  const interlocks = interlocksFor(draft, ctx);
  const armed = isArmed(interlocks);
  const blocker = firstOpen(interlocks);
  const call = buildCall(draft, ctx);
  const split = splitOf(draft.creatorShareBps);

  const supply = parseSupply(draft.supply);
  const payout = normalizeAddress(draft.payoutAddress);
  const treasuryInput = draft.treasury.trim();
  const treasury =
    treasuryInput.length === 0 ? null : normalizeAddress(treasuryInput);
  const symbol = normalizeSymbol(draft.symbol);
  const selectedFromRegistry = payoutAssets.find(
    (asset) => asset.address.toLowerCase() === draft.payoutAddress.toLowerCase(),
  );

  function copyParameters() {
    const payload = JSON.stringify(
      {
        chainId: robinhoodChain.id,
        factory: launchConfig.factoryAddress ?? null,
        function: "createPad",
        args: Object.fromEntries(call.args.map((arg) => [arg.name, arg.value])),
        value: call.value.toString(),
      },
      null,
      2,
    );
    navigator.clipboard
      ?.writeText(payload)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2_000);
      })
      .catch(() => setCopied(false));
  }

  function deploy() {
    if (!armed || !launchConfig.factoryAddress || supply === null || !payout) {
      return;
    }
    const creatorTreasury = treasury ?? address;
    if (!creatorTreasury) return;

    writeContract({
      address: launchConfig.factoryAddress as `0x${string}`,
      abi: padFactoryAbi,
      functionName: "createPad",
      args: [
        draft.name.trim(),
        symbol,
        parseUnits(supply.toString(), limits.decimals),
        payout,
        draft.tradeFeeBps,
        split.creatorShareBps,
        creatorTreasury,
      ],
      value: splitTerms.launchFeeWei,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
      <div className="space-y-6">
        {/* ---------------------------------------------------------- 01 */}
        <StationCard
          index="01"
          title="Identity"
          note="What the token is called."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Token name"
              hint={`Up to ${limits.nameMax} characters`}
              invalid={draft.name.length > limits.nameMax}
            >
              <input
                className={clsx(
                  "field",
                  draft.name.length > limits.nameMax && "field-invalid",
                )}
                value={draft.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="Blue Chip Dividend"
                maxLength={64}
              />
            </Field>
            <Field
              label="Ticker"
              hint={`${limits.symbolMin}–${limits.symbolMax} letters or digits`}
              invalid={
                draft.symbol.length > 0 && symbol.length < limits.symbolMin
              }
            >
              <input
                className={clsx(
                  "field uppercase",
                  draft.symbol.length > 0 &&
                    symbol.length < limits.symbolMin &&
                    "field-invalid",
                )}
                value={draft.symbol}
                onChange={(event) =>
                  update({ symbol: normalizeSymbol(event.target.value) })
                }
                placeholder="BCD"
              />
            </Field>
            <Field
              label="Total supply"
              hint={
                supply === null && draft.supply.trim().length > 0
                  ? "Whole tokens only, within range"
                  : `Fixed at deploy · ${limits.decimals} decimals`
              }
              invalid={supply === null && draft.supply.trim().length > 0}
            >
              <input
                className={clsx(
                  "field",
                  supply === null &&
                    draft.supply.trim().length > 0 &&
                    "field-invalid",
                )}
                value={draft.supply}
                onChange={(event) => update({ supply: event.target.value })}
                placeholder="1000000000"
                inputMode="numeric"
              />
            </Field>
            <Field label="Base units" hint="What the contract actually receives">
              <output className="field block truncate text-ink-faint">
                {supply === null
                  ? "—"
                  : parseUnits(supply.toString(), limits.decimals).toString()}
              </output>
            </Field>
          </div>
        </StationCard>

        {/* ---------------------------------------------------------- 02 */}
        <StationCard
          index="02"
          title="Payout asset"
          note="The contract the fees will buy, over and over, for your holders."
        >
          {registryIsEmpty ? (
            <div className="rounded-2xl border border-rule-2 bg-white/55 p-5">
              <Chip tone="held" lamp>
                Registry empty
              </Chip>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
                No tokenized equity has been verified on {robinhoodChain.name}{" "}
                for this registry yet, so there is nothing to pick from a list.
                You can still point a pad at any contract by address — but a pad
                buys whatever it is handed, so an address you have not checked
                yourself is a mistake that spends real fees.
              </p>
              <ul className="mt-5 space-y-2.5">
                {assetStandard.map((line) => (
                  <li key={line} className="flex gap-3 text-[12px] text-ink-dim">
                    <span
                      aria-hidden
                      className="lamp lamp-held mt-1.5 shrink-0"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              role="radiogroup"
              aria-label="Payout asset"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {payoutAssets.map((asset) => {
                const selected =
                  asset.address.toLowerCase() ===
                  draft.payoutAddress.trim().toLowerCase();
                return (
                  <button
                    key={asset.address}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ payoutAddress: asset.address })}
                    className={clsx(
                      "rounded-2xl border px-4 py-3.5 text-left transition",
                      selected
                        ? "border-transparent bg-slate text-slate-ink"
                        : "border-rule-2 bg-white/60 hover:bg-white/90",
                    )}
                  >
                    <span className="mono block text-[14px]">
                      {asset.symbol}
                    </span>
                    <span
                      className={clsx(
                        "mt-1 block text-[12px]",
                        selected ? "text-slate-dim" : "text-ink-faint",
                      )}
                    >
                      {asset.name}
                    </span>
                    <span
                      className={clsx(
                        "mono mt-2 block text-[10px]",
                        selected ? "text-slate-faint" : "text-ink-faint",
                      )}
                    >
                      {shortAddress(asset.address)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5">
            <Field
              label="Payout contract address"
              hint={
                selectedFromRegistry
                  ? `${selectedFromRegistry.symbol} — from the registry`
                  : payout
                    ? "Accepted — unverified by this site"
                    : "An ERC-20 on Robinhood Chain"
              }
              invalid={draft.payoutAddress.trim().length > 0 && payout === null}
            >
              <input
                className={clsx(
                  "field",
                  draft.payoutAddress.trim().length > 0 &&
                    payout === null &&
                    "field-invalid",
                )}
                value={draft.payoutAddress}
                onChange={(event) =>
                  update({ payoutAddress: event.target.value })
                }
                placeholder="0x…"
                spellCheck={false}
              />
            </Field>
            {payout && !selectedFromRegistry && (
              <p className="mt-2.5 text-[12px] leading-snug text-ink-dim">
                This address is not in the registry. Nothing here has checked
                that it is an ERC-20, that it is transferable, or that it is
                what you think it is.
              </p>
            )}
          </div>
        </StationCard>

        {/* ---------------------------------------------------------- 03 */}
        <StationCard
          index="03"
          title="Trading fee"
          note="Taken off each trade in your token. Everything else the trader keeps."
        >
          <div className="flex flex-wrap items-end gap-5">
            <div>
              <span className="label">Fee</span>
              <p className="mono num mt-1.5 text-[44px] leading-none">
                {bpsToPercent(draft.tradeFeeBps)}
              </p>
            </div>
            <p className="mono mb-1.5 text-[11px] text-ink-faint">
              {draft.tradeFeeBps} bps · min{" "}
              {bpsToPercent(feeBounds.minTradeFeeBps)} · max{" "}
              {bpsToPercent(feeBounds.maxTradeFeeBps)}
            </p>
          </div>
          <input
            type="range"
            className="detent mt-5"
            min={feeBounds.minTradeFeeBps}
            max={feeBounds.maxTradeFeeBps}
            step={5}
            value={draft.tradeFeeBps}
            onChange={(event) =>
              update({ tradeFeeBps: Number(event.target.value) })
            }
            aria-label="Trading fee in basis points"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {[50, 100, 150, 300, 500]
              .filter(
                (bps) =>
                  bps >= feeBounds.minTradeFeeBps &&
                  bps <= feeBounds.maxTradeFeeBps,
              )
              .map((bps) => (
                <button
                  key={bps}
                  type="button"
                  onClick={() => update({ tradeFeeBps: bps })}
                  className={clsx(
                    "mono rounded-full border px-3.5 py-2 text-[10px] tracking-[0.12em] uppercase transition",
                    draft.tradeFeeBps === bps
                      ? "border-transparent bg-slate text-slate-ink"
                      : "border-rule-2 bg-white/50 text-ink-dim hover:bg-white/90",
                  )}
                >
                  {bpsToPercent(bps)}
                </button>
              ))}
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-ink-dim">
            A high fee funds bigger payouts and makes the token more expensive
            to trade. That trade-off is yours to make and it is fixed at deploy
            — the pad has no function to change it afterwards, so nobody can
            raise it on your holders later, including you.
          </p>
        </StationCard>

        {/* ---------------------------------------------------------- 04 */}
        <StationCard
          index="04"
          title="Split"
          note="How each collected fee divides. Two of the three shares are yours to set."
        >
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="label">Your share of the fee</span>
              <p className="mono num mt-1.5 text-[44px] leading-none">
                {bpsToPercent(draft.creatorShareBps)}
              </p>
            </div>
            <p className="mono mb-1.5 max-w-[280px] text-[11px] leading-snug text-ink-faint">
              Capped at {bpsToPercent(maxCreatorShareBps)} so at least{" "}
              {bpsToPercent(splitTerms.minHolderShareBps)} of every fee always
              reaches holders.
            </p>
          </div>
          <input
            type="range"
            className="detent mt-5"
            min={0}
            max={maxCreatorShareBps}
            step={100}
            value={draft.creatorShareBps}
            onChange={(event) =>
              update({ creatorShareBps: Number(event.target.value) })
            }
            aria-label="Creator share of the fee, in basis points"
          />
          <div className="mt-7">
            <SplitBar
              tradeFeeBps={draft.tradeFeeBps}
              creatorShareBps={draft.creatorShareBps}
            />
          </div>
          <div className="mt-7">
            <Field
              label="Creator treasury"
              hint={
                treasuryInput.length === 0
                  ? address
                    ? `Defaults to ${shortAddress(address)}`
                    : "Defaults to the wallet that signs"
                  : treasury
                    ? "Accepted"
                    : "Not a valid address"
              }
              invalid={treasuryInput.length > 0 && treasury === null}
            >
              <input
                className={clsx(
                  "field",
                  treasuryInput.length > 0 &&
                    treasury === null &&
                    "field-invalid",
                )}
                value={draft.treasury}
                onChange={(event) => update({ treasury: event.target.value })}
                placeholder="0x… (optional)"
                spellCheck={false}
              />
            </Field>
          </div>
        </StationCard>
      </div>

      {/* ------------------------------------------------------- review */}
      <aside className="space-y-4 lg:sticky lg:top-28">
        <div className="glass overflow-hidden">
          <GlassHead
            title="The call"
            aside={
              <button
                type="button"
                onClick={copyParameters}
                className="mono text-[10px] tracking-[0.14em] text-ink-dim uppercase transition hover:text-ink"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            }
          />
          <div className="px-5 py-4">
            <p className="mono text-[11px] break-all text-ink-faint">
              {launchConfig.factoryAddress ?? "factory: not deployed"}
            </p>
            <p className="mono mt-1.5 text-[12px] text-ink">createPad(</p>
            <dl className="mt-1.5 space-y-2 pl-3">
              {call.args.map((arg) => (
                <div key={arg.name} className="flex items-baseline gap-2">
                  <dt className="mono w-[128px] shrink-0 text-[10px] text-ink-faint">
                    {arg.type} {arg.name}
                  </dt>
                  <dd className="mono num min-w-0 flex-1 truncate text-[11px] text-ink">
                    {arg.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mono mt-1.5 text-[12px] text-ink">)</p>
            <p className="mono mt-4 border-t border-rule pt-4 text-[10px] tracking-[0.12em] text-ink-faint uppercase">
              Value {call.value.toString()} wei · launching costs gas and
              nothing else
            </p>
          </div>
        </div>

        <InterlockPanel interlocks={interlocks} />

        <div className="glass overflow-hidden">
          <GlassHead
            title="Control"
            aside={
              armed ? (
                <Chip tone="live" lamp>
                  Armed
                </Chip>
              ) : (
                <Chip tone="held" lamp>
                  Held
                </Chip>
              )
            }
          />
          <div className="p-5">
            {armed ? (
              <button
                type="button"
                onClick={deploy}
                disabled={isSigning || isMining}
                className="pill pill-lime w-full py-6 text-[13px] tracking-[0.26em]"
              >
                {isSigning
                  ? "Confirm in wallet…"
                  : isMining
                    ? "Deploying…"
                    : "Launch pad"}
              </button>
            ) : (
              <div>
                <div className="held-plate flex h-[92px] items-center justify-center">
                  <span className="mono text-[12px] tracking-[0.28em] text-ink-dim uppercase">
                    Held
                  </span>
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-ink-dim">
                  {blocker ? `${blocker.label}: ${blocker.status}.` : "Held."}{" "}
                  <span className="text-ink-faint">
                    The control arms when every interlock closes.
                  </span>
                </p>
              </div>
            )}

            {!address && (
              <div className="mt-4 flex justify-end">
                <WalletConnect />
              </div>
            )}

            {writeError && (
              <p className="mono mt-4 text-[11px] leading-snug text-ink-dim">
                {writeError.message}
              </p>
            )}
            {hash && (
              <p className="mono mt-4 text-[11px] break-all text-ink-dim">
                {isMined ? "Deployed · " : "Submitted · "}
                <a
                  className="underline"
                  href={explorer.tx(hash)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {hash}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rule bg-white/50 px-5 py-4">
          <p className="text-[11px] leading-snug text-ink-faint">
            This draft is saved in this browser only. There is no backend on
            this site.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mono shrink-0 text-[10px] tracking-[0.14em] text-ink-dim uppercase transition hover:text-ink"
          >
            Clear
          </button>
        </div>
      </aside>
    </div>
  );
}

function StationCard({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass overflow-hidden">
      <GlassHead title={`Station ${index}`} aside={<span>{title}</span>} />
      <div className="p-6">
        <p className="mb-6 text-[13px] leading-relaxed text-ink-dim">{note}</p>
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  invalid,
  children,
}: {
  label: string;
  hint?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint && (
        <span
          className={clsx(
            "mono mt-2 block text-[10px] leading-snug",
            invalid ? "text-ink" : "text-ink-faint",
          )}
        >
          {hint}
        </span>
      )}
    </label>
  );
}
