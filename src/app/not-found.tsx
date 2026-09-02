import Link from "next/link";

/**
 * Ship one of these on every project: Next's default 404 is unstyled, and on a
 * page with its own ground and type scale it reads as a broken deploy rather
 * than a wrong URL.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col items-start px-4 py-32 sm:px-6">
      <p className="label text-halt-ink">404</p>
      <h1 className="stencil mt-4 text-[clamp(2.4rem,8vw,5rem)] leading-none">
        No such station
      </h1>
      <p className="mt-5 max-w-[52ch] text-[14px] leading-relaxed text-ink-dim">
        That route does not exist on this site.
      </p>
      <Link
        href="/"
        className="control mt-8"
      >
        <span aria-hidden>←</span> Back to the pad
      </Link>
    </div>
  );
}
