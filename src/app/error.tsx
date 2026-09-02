"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col items-start px-4 py-32 sm:px-6">
      <p className="label text-lime-deep">Fault</p>
      <h1 className="display mt-4 text-[clamp(2.4rem,8vw,5rem)] leading-none">
        Something broke
      </h1>
      <p className="mt-5 max-w-[52ch] text-[14px] leading-relaxed text-ink-dim">
        This page failed to render. Nothing was signed, sent or stored — this
        site holds no funds, has no backend, and writes nothing onchain.
      </p>
      {error.digest && (
        <p className="mono num mt-3 text-[11px] text-ink-faint">
          digest {error.digest}
        </p>
      )}
      <button type="button" onClick={reset} className="pill pill-dark mt-8">
        Try again
      </button>
    </div>
  );
}
