import { clsx } from "clsx";

type Tone = "neutral" | "held" | "live" | "slate";

/**
 * The held tone carries a lot of this site, on purpose: before a factory is
 * deployed, almost every state worth naming is "held". It is chrome rather
 * than a warning colour — grey is not a signal, so a held chip always says the
 * word too, and colour is never the only thing carrying the state.
 */
const tones: Record<Tone, string> = {
  neutral: "border-rule-2 bg-white/55 text-ink-dim",
  held: "border-rule-2 bg-white/70 text-ink-dim",
  live: "border-lime-deep/25 bg-lime-pale/70 text-lime-deep",
  slate: "border-slate-rule bg-white/10 text-slate-dim",
};

export function Chip({
  children,
  tone = "neutral",
  lamp = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  lamp?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "mono inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] tracking-[0.14em] whitespace-nowrap uppercase",
        tones[tone],
        className,
      )}
    >
      {lamp && (
        <span
          aria-hidden
          className={clsx(
            "lamp",
            tone === "live" ? "lamp-live" : "lamp-held",
            tone === "held" && "animate-blink",
          )}
        />
      )}
      {children}
    </span>
  );
}
