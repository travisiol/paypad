"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { navLinks } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import { Mark } from "./Mark";
import { WalletConnect } from "./WalletConnect";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rule-2 bg-steel/92 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${siteConfig.wordmark} home`}
        >
          <Mark className="h-5 w-5 text-ink" />
          <span className="stencil text-[15px] tracking-[0.06em]">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mono px-2.5 py-2 text-[10px] tracking-[0.16em] text-ink-dim uppercase transition hover:text-halt-ink"
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
            className="mono border border-rule-2 px-3 py-2 text-[10px] tracking-[0.16em] text-ink uppercase md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div
        id="nav-menu"
        hidden={!open}
        className={clsx("border-t border-rule-2 bg-steel-2 md:hidden")}
      >
        <nav className="mx-auto flex w-full max-w-[1180px] flex-col px-4 py-2 sm:px-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="mono border-b border-rule py-3 text-[11px] tracking-[0.16em] text-ink uppercase last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
          <div className="py-3">
            <WalletConnect />
          </div>
        </nav>
      </div>
    </header>
  );
}
