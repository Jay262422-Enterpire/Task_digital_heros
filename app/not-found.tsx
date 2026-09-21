import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-4xl">That page wandered off</h1>
      <p className="mt-3 text-muted-foreground">
        The draw, the charity, or the player you asked for is not here.
      </p>
      <Link href="/" className="mt-6 inline-block text-primary underline-offset-4 hover:underline">
        Back to the homepage
      </Link>
    </div>
  );
}
