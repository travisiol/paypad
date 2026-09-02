"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import { Mark } from "./Mark";
import { WalletConnect } from "./WalletConnect";

/**
 * A floating glass bar rather than a full-width band: the wash behind it has
 * to keep running edge to edge, or the page stops looking like one sheet.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="glass mx-auto w-full max-w-[1180px]">
        <div className="flex items-center gap-4 px-4 py-2.5 sm:px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${siteConfig.wordmark} home`}
          >
            <Mark className="h-[30px] w-[30px]" />
            <span className="display text-[16px] tracking-[-0.02em]">
              {siteConfig.wordmark}
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mono rounded-full px-3 py-2 text-[10px] tracking-[0.14em] text-ink-dim uppercase transition hover:bg-white/70 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto md:ml-2">
            <WalletConnect className="hidden md:inline-flex" />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="nav-menu"
              className="mono rounded-full border border-rule-2 px-4 py-2 text-[10px] tracking-[0.14em] text-ink uppercase md:hidden"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        <div id="nav-menu" hidden={!open} className="border-t border-rule md:hidden">
          <nav className="flex flex-col px-4 py-1 sm:px-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="mono border-b border-rule py-3.5 text-[11px] tracking-[0.14em] text-ink uppercase last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            <div className="py-3">
              <WalletConnect />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
