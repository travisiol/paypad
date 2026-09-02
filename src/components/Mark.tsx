import { GlassAsterisk } from "./Glass";

/**
 * The mark: the glass asterisk, the same object at every size — but drawn flat
 * in the lockup. At 30px the full treatment collapses into a grey blob; flat
 * keeps the chrome gradient and drops the rim and specular that only read at
 * size. See the note on GlassAsterisk.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <GlassAsterisk
      id="mark"
      className={className}
      glow={false}
      flat
      strokeWidth={12}
    />
  );
}
