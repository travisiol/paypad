import { clsx } from "clsx";

/**
 * Section chrome in the machine register: a stamped station number on a steel
 * tab, a rule running to the edge of the column, and the title in stencil.
 * The page is numbered end to end so a reader can say where they are without
 * a scrollbar — and because a production line has stations, not chapters.
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
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <span className="label mono border border-rule-2 bg-steel-3 px-2 py-1 text-ink-dim">
          ST {index}
        </span>
        <span aria-hidden className="h-px flex-1 bg-rule-2" />
        {aside}
      </div>
      <h2 className="stencil mt-4 text-[clamp(1.7rem,4vw,2.75rem)] leading-[1.02] tracking-[-0.01em]">
        {title}
      </h2>
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
        "mx-auto w-full max-w-[1180px] scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PlateHead({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="plate-head">
      <span>{title}</span>
      {aside}
    </div>
  );
}

export function RigHead({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="rig-head">
      <span>{title}</span>
      {aside}
    </div>
  );
}

/**
 * The window a value appears in once there is one. Until then it shows an em
 * dash on a recessed field — an instrument with nothing to display, which is
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
