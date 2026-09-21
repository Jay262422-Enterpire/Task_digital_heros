"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-3xl">Something snapped</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
