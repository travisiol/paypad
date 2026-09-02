"use client";

import { useConnect, useConnection, useDisconnect, useSwitchChain } from "wagmi";
import { clsx } from "clsx";
import { robinhoodChain } from "@/lib/chain";
import { shortAddress } from "@/lib/payout-assets";

/**
 * Injected connector only — no WalletConnect project id, no wallet library.
 * wagmi's `ssr: true` keeps the server render and the first client render both
 * "disconnected", so no hydration gate is needed here.
 *
 * Connecting closes two interlocks on the launch console and unlocks nothing
 * else: there is no factory to deploy from yet. It is wired now so the network
 * path is real and testable before launch rather than written on launch day.
 */
export function WalletConnect({ className }: { className?: string }) {
  const { address, isConnected, chainId } = useConnection();
  const {
    connect,
    connectors,
    isPending: isConnecting,
    error: connectError,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { mutate: switchChain, isPending: isSwitching } = useSwitchChain();

  const wrongNetwork = isConnected && chainId !== robinhoodChain.id;

  if (isConnected && address) {
    if (wrongNetwork) {
      return (
        <button
          type="button"
          onClick={() => switchChain({ chainId: robinhoodChain.id })}
          disabled={isSwitching}
          className={clsx(
            "mono border border-halt/50 bg-halt-soft px-3 py-2 text-[10px] tracking-[0.16em] text-halt-ink uppercase transition hover:bg-halt/15 disabled:opacity-60",
            className,
          )}
        >
          {isSwitching ? "Switching…" : "Wrong network — switch"}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => disconnect()}
        title="Disconnect wallet"
        className={clsx(
          "mono flex items-center gap-2 border border-rule-2 px-3 py-2 text-[10px] tracking-[0.16em] text-ink uppercase transition hover:border-halt-ink hover:text-halt-ink",
          className,
        )}
      >
        <span aria-hidden className="lamp bg-live" />
        {/* normal-case: an address must keep its EIP-55 casing */}
        <span className="num normal-case">{shortAddress(address)}</span>
      </button>
    );
  }

  const injectedConnector = connectors[0];

  return (
    <div className={clsx("flex flex-col items-end gap-1", className)}>
      <button
        type="button"
        disabled={!injectedConnector || isConnecting}
        onClick={() =>
          injectedConnector && connect({ connector: injectedConnector })
        }
        className="mono border border-ink/70 bg-panel px-3 py-2 text-[10px] tracking-[0.16em] text-panel-ink uppercase transition hover:bg-panel-2 disabled:cursor-not-allowed disabled:border-rule disabled:bg-transparent disabled:text-ink-faint"
      >
        {isConnecting
          ? "Connecting…"
          : injectedConnector
            ? "Connect wallet"
            : "No wallet found"}
      </button>
      {connectError && (
        <span className="mono max-w-[220px] text-right text-[10px] leading-tight text-halt-ink">
          {connectError.message}
        </span>
      )}
    </div>
  );
}
