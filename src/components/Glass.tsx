import { clsx } from "clsx";

/**
 * The chrome-glass objects.
 *
 * Every one of these is drawn, not rendered: three stacked strokes along the
 * same path — a dark rim, a chrome body, and an offset white specular — which
 * is what gives an extruded tube its edge without a single raster asset. The
 * body gradient runs top-to-bottom regardless of the direction an arm points,
 * because that is how real chrome behaves: it reflects the horizon, not its
 * own geometry.
 *
 * Ids are namespaced per instance. Two of these on one page sharing gradient
 * ids would have the second silently steal the first's fills.
 *
 * Every gradient is `userSpaceOnUse`, and that is load-bearing rather than
 * stylistic. Under the default `objectBoundingBox` a gradient resolves against
 * each element's own box — and a perfectly vertical stroke has a box of zero
 * width, which the spec says makes the element *not render at all*. The
 * asterisk's vertical arm and the arrow's vertical shaft both vanished, so the
 * mark rendered as an X. In user space the sweep also runs continuously across
 * the whole object, which is what chrome actually does: it reflects one
 * horizon, not one per arm.
 *
 * The flat stops never reach pure white.
 *
 * The full gradient ends white at both extremes, which is right on a large
 * object where the rim and the specular carry the silhouette — and wrong in a
 * nav lockup sitting on white glass, where the tips of every arm simply
 * vanished and the mark read as a horizontal smudge. Flat keeps the chrome
 * banding but bottoms out at a tone the page can still show.
 */
function ChromeDefs({
  id,
  glow,
  flat = false,
}: {
  id: string;
  glow: boolean;
  flat?: boolean;
}) {
  return (
    <defs>
      <linearGradient
        id={`${id}-body`}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="6"
        x2="0"
        y2="94"
      >
        {flat ? (
          <>
            <stop offset="0%" stopColor="#f0f3f0" />
            <stop offset="30%" stopColor="#d2d9d4" />
            <stop offset="52%" stopColor="#8f9a93" />
            <stop offset="74%" stopColor="#cdd5cf" />
            <stop offset="100%" stopColor="#eef1ee" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="16%" stopColor="#f6f8f6" />
            <stop offset="38%" stopColor="#d3dad5" />
            <stop offset="54%" stopColor="#98a29b" />
            <stop offset="68%" stopColor="#c8d0ca" />
            <stop offset="86%" stopColor="#f2f5f2" />
            <stop offset="100%" stopColor="#ffffff" />
          </>
        )}
      </linearGradient>
      <linearGradient
        id={`${id}-rim`}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="6"
        x2="0"
        y2="94"
      >
        {flat ? (
          <>
            <stop offset="0%" stopColor="#7f8a83" />
            <stop offset="50%" stopColor="#5d6862" />
            <stop offset="100%" stopColor="#7f8a83" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#b9c2bb" />
            <stop offset="50%" stopColor="#6f7a72" />
            <stop offset="100%" stopColor="#aab4ad" />
          </>
        )}
      </linearGradient>
      <linearGradient
        id={`${id}-spec`}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="6"
        x2="0"
        y2="94"
      >
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      {glow && (
        <filter id={`${id}-lift`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="12"
            floodColor="#4a5c2a"
            floodOpacity="0.22"
          />
        </filter>
      )}
    </defs>
  );
}

function Tube({
  id,
  d,
  width,
  flat = false,
}: {
  id: string;
  d: string;
  width: number;
  /** Small sizes only: thin rim, no specular. See GlassAsterisk. */
  flat?: boolean;
}) {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={`url(#${id}-rim)`}
        strokeWidth={width + (flat ? 1.1 : 2.4)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={`url(#${id}-body)`}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!flat && (
        <path
          d={d}
          fill="none"
          stroke={`url(#${id}-spec)`}
          strokeWidth={width * 0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(0 -${width * 0.24})`}
        />
      )}
    </>
  );
}

/** Six arms on three axes, with two shortened so it reads as an object. */
const ARMS = [
  { angle: 90, length: 1 },
  { angle: 30, length: 0.86 },
  { angle: -30, length: 1 },
  { angle: -90, length: 1 },
  { angle: -150, length: 0.92 },
  { angle: 150, length: 1 },
];

function asteriskPaths(radius: number, equal: boolean) {
  return ARMS.map(({ angle, length }) => {
    const rad = (angle * Math.PI) / 180;
    const scale = equal ? 1 : length;
    const x = 50 + Math.cos(rad) * radius * scale;
    const y = 50 - Math.sin(rad) * radius * scale;
    return `M50 50 L${x.toFixed(2)} ${y.toFixed(2)}`;
  });
}

/**
 * `flat` is for anything rendered small — a nav lockup, a bullet.
 *
 * At 28px the full treatment collapses: a 2.4-unit rim on each side of a
 * 17-unit arm is most of the arm once it is scaled down, the specular lands on
 * a subpixel, and the two shortened arms read as a drawing error rather than
 * as an object. Flat keeps the chrome gradient — which is the whole identity —
 * and drops everything that only works at size.
 */
export function GlassAsterisk({
  id,
  className,
  glow = true,
  strokeWidth = 15,
  flat = false,
}: {
  id: string;
  className?: string;
  glow?: boolean;
  strokeWidth?: number;
  flat?: boolean;
}) {
  const paths = asteriskPaths(flat ? 44 : 42, flat);

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <ChromeDefs id={id} glow={glow} flat={flat} />
      <g filter={glow ? `url(#${id}-lift)` : undefined}>
        {paths.map((d) => (
          <Tube key={d} id={id} d={d} width={strokeWidth} flat={flat} />
        ))}
      </g>
    </svg>
  );
}

export function GlassArrow({
  id,
  className,
  glow = true,
}: {
  id: string;
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <ChromeDefs id={id} glow={glow} />
      <g filter={glow ? `url(#${id}-lift)` : undefined}>
        <Tube id={id} d="M22 78 L74 26" width={14} />
        <Tube id={id} d="M44 24 L76 24 L76 56" width={14} />
      </g>
    </svg>
  );
}

/**
 * The construction lines the page is drawn on: a ruled frame, two diagonals
 * and a circle, in the lightest tone on the site. `slice` keeps the circle
 * round at any width — a squashed construction circle is worse than none.
 */
export function DraftLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 620"
      preserveAspectRatio="xMidYMid slice"
      className={clsx("stroke-draft", className)}
      aria-hidden
    >
      <g fill="none" strokeWidth="1">
        <line x1="260" y1="0" x2="260" y2="620" />
        <line x1="1180" y1="0" x2="1180" y2="620" />
        <line x1="0" y1="24" x2="1440" y2="24" />
        <line x1="0" y1="470" x2="1440" y2="470" />
        <line x1="0" y1="470" x2="720" y2="24" />
        <line x1="1440" y1="470" x2="720" y2="24" />
        <line x1="260" y1="24" x2="1180" y2="470" />
        <circle cx="720" cy="250" r="222" />
      </g>
    </svg>
  );
}
