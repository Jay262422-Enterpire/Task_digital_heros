import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          digital.<span className="text-primary">HEROES</span> — a draw for people who want their
          round to land somewhere that matters.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/how-it-works" className="hover:text-foreground">
            Draw rules
          </Link>
          <Link href="/charities" className="hover:text-foreground">
            Charities
          </Link>
          <Link href="/donate" className="hover:text-foreground">
            Independent gift
          </Link>
        </div>
      </div>
    </footer>
  );
}
