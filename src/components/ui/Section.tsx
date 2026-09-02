import { clsx } from "clsx";

/**
 * Section chrome: a stamped station number in a pill, a hairline running to
 * the edge of the column, and the title in display type. The page is numbered
 * end to end so a reader can say where they are without a scrollbar — and
 * because a production line has stations, not chapters.
 */
export function StationHead({
  index,
  title,
  aside,
}: {
  index: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4">
        <span className="mono rounded-full border border-rule-2 bg-white/60 px-3 py-1.5 text-[10px] tracking-[0.16em] text-ink-dim uppercase">
          ST {index}
        </span>
        <span aria-hidden className="h-px flex-1 bg-rule-2" />
        {aside}
      </div>
      <h2 className="display mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)]">{title}</h2>
    </div>
  );
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={clsx(
        "mx-auto w-full max-w-[1180px] scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function GlassHead({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="glass-head">
      <span>{title}</span>
      {aside}
    </div>
  );
}

export function SlabHead({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="slab-head">
      <span>{title}</span>
      {aside}
    </div>
  );
}

/**
 * The window a value appears in once there is one. Until then it shows an em
 * dash on a ruled blank — an instrument with nothing to display, which is
 * unmistakably not a number. Nothing on this site invents a reading.
 */
export function Readout({
  value,
  width = "5rem",
  title = "No reading — nothing deployed",
  className,
}: {
  value?: string | null;
  width?: string;
  title?: string;
  className?: string;
}) {
  if (value) {
    return <span className={clsx("mono num", className)}>{value}</span>;
  }
  return (
    <span
      className={clsx(
        "mono num inline-block border-b border-rule-2 text-center text-ink-faint",
        className,
      )}
      style={{ minWidth: width }}
      title={title}
    >
      —
    </span>
  );
}
