import { clsx } from "clsx";

type Tone = "halt" | "live" | "muted" | "panel";

/**
 * The halt tone carries a lot of this site, on purpose: before a factory is
 * deployed, almost every state worth naming is "held".
 */
const tones: Record<Tone, string> = {
  halt: "border-halt/45 bg-halt-soft text-halt-ink",
  live: "border-live/40 bg-live-soft text-live",
  muted: "border-rule-2 bg-steel-3/60 text-ink-faint",
  panel: "border-panel-rule bg-panel-2 text-panel-dim",
};

const lamps: Record<Tone, string> = {
  halt: "bg-halt",
  live: "bg-live",
  muted: "bg-ink-faint",
  panel: "bg-panel-faint",
};

export function Chip({
  children,
  tone = "muted",
  lamp = false,
  blink = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  lamp?: boolean;
  blink?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "mono inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] tracking-[0.16em] whitespace-nowrap uppercase",
        tones[tone],
        className,
      )}
    >
      {lamp && (
        <span
          aria-hidden
          className={clsx("lamp", lamps[tone], blink && "animate-blink")}
        />
      )}
      {children}
    </span>
  );
}
