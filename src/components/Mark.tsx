/**
 * The mark: a launch pad seen head-on — a bolted plate with a payload sitting
 * on it and the hold-down clamps either side. Drawn, not lettered, so the
 * favicon and the nav lockup are the same object at two sizes.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      shapeRendering="crispEdges"
    >
      {/* pad */}
      <rect
        x="2"
        y="17"
        width="20"
        height="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* hold-down clamps */}
      <path d="M6 17V13M18 17V13" stroke="currentColor" strokeWidth="1.5" />
      {/* payload */}
      <path
        d="M12 2 L16 10 V15 H8 V10 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
