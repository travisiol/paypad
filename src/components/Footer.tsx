import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { siteConfig, launchConfig } from "@/lib/site-config";
import { Mark } from "./Mark";
import { Chip } from "./ui/Chip";

export function Footer() {
  return (
    <footer className="border-t border-rule-2 bg-steel-3">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Mark className="h-5 w-5 text-ink" />
              <span className="stencil text-[15px] tracking-[0.06em]">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">
              {siteConfig.description}
            </p>
            <div className="mt-4">
              {launchConfig.isLive ? (
                <Chip tone="live" lamp>
                  Factory armed
                </Chip>
              ) : (
                <Chip tone="halt" lamp blink>
                  No factory deployed
                </Chip>
              )}
            </div>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="label">Sections</p>
              <ul className="mt-3 space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="mono text-[11px] tracking-[0.1em] text-ink-dim uppercase transition hover:text-halt-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Elsewhere</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href={siteConfig.x}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="mono text-[11px] tracking-[0.1em] text-ink-dim uppercase transition hover:text-halt-ink"
                  >
                    X
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-rule-2 pt-6">
          <p className="mono text-[10px] leading-relaxed tracking-[0.08em] text-ink-faint uppercase">
            Nothing on this page is an offer, a solicitation, or investment
            advice. A pad distributes exposure to whatever asset it is pointed
            at; where that asset is a tokenized equity, distributing it may be a
            regulated activity in your jurisdiction and is your responsibility,
            not the protocol&rsquo;s. No factory is deployed and no pad exists.
          </p>
        </div>
      </div>
    </footer>
  );
}
