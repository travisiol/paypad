import { clsx } from "clsx";
import type { Interlock } from "@/lib/launch-plan";

/**
 * The safety chain, as a panel.
 *
 * Every link states what has to be true and what is actually the case, so a
 * blocked launch is never a mystery — the reason is on the row, in words, next
 * to the lamp. Colour is never the only signal: each row also carries OPEN or
 * CLOSED as text.
 */
export function InterlockPanel({
  interlocks,
  className,
}: {
  interlocks: Interlock[];
  className?: string;
}) {
  const closed = interlocks.filter((interlock) => interlock.closed).length;

  return (
    <div className={clsx("rig", className)}>
      <div className="rig-head">
        <span>Interlocks</span>
        <span className="mono num text-panel-ink">
          {closed}/{interlocks.length} closed
        </span>
      </div>
      <ul className="divide-y divide-panel-rule">
        {interlocks.map((interlock) => (
          <li key={interlock.id} className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden
              className={clsx(
                "lamp mt-1.5 shrink-0",
                interlock.closed ? "bg-live-bright" : "animate-blink bg-halt-bright",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="mono text-[11px] tracking-[0.14em] text-panel-ink uppercase">
                  {interlock.label}
                </span>
                <span
                  className={clsx(
                    "mono text-[9px] tracking-[0.2em] uppercase",
                    interlock.closed ? "text-live-bright" : "text-halt-bright",
                  )}
                >
                  {interlock.closed ? "Closed" : "Open"}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-panel-dim">
                {interlock.requirement}
              </p>
              <p className="mono mt-1 text-[11px] leading-snug text-panel-faint">
                {interlock.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
