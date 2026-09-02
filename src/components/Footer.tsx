import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { siteConfig, launchConfig } from "@/lib/site-config";
import { Mark } from "./Mark";
import { Chip } from "./ui/Chip";
import { GlassAsterisk } from "./Glass";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-rule">
      <GlassAsterisk
        id="footer-star"
        className="pointer-events-none absolute -right-24 -bottom-28 h-[300px] w-[300px] opacity-70 blur-[6px]"
      />
      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Mark className="h-[30px] w-[30px]" />
              <span className="display text-[16px] tracking-[-0.02em]">
                {siteConfig.wordmark}
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
              {siteConfig.description}
            </p>
            <div className="mt-5">
              {launchConfig.isLive ? (
                <Chip tone="live" lamp>
                  Factory armed
                </Chip>
              ) : (
                <Chip tone="held" lamp>
                  No factory deployed
                </Chip>
              )}
            </div>
          </div>

          <div className="flex gap-14">
            <div>
              <p className="label">Sections</p>
              <ul className="mt-4 space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="mono text-[11px] tracking-[0.1em] text-ink-dim uppercase transition hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Elsewhere</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href={siteConfig.x}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="mono text-[11px] tracking-[0.1em] text-ink-dim uppercase transition hover:text-ink"
                  >
                    X
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-rule pt-6">
          <p className="mono max-w-4xl text-[10px] leading-relaxed tracking-[0.06em] text-ink-faint uppercase">
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
