import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";

const publicLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/charities", label: "Charities" },
  { href: "/donate", label: "Donate" },
];

export function SiteHeader({ session }: { session: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            DH
          </span>
          <span className="font-heading text-lg tracking-tight">
            digital.<em className="not-italic text-primary">HEROES</em>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          {session?.role === "ADMIN" ? (
            <Link href="/admin" className="transition-colors hover:text-foreground">
              Admin
            </Link>
          ) : session ? (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          ) : null}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <form action={logoutAction}>
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          ) : (
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
              Sign in
            </Link>
          )}
          <Link
            href={session?.role === "ADMIN" ? "/admin" : session ? "/dashboard" : "/signup"}
            className={cn(buttonVariants(), "rounded-full px-4")}
          >
            {session?.role === "ADMIN" ? "Control room" : session ? "Your desk" : "Subscribe"}
          </Link>
        </div>
        <MobileNav session={session} />
      </div>
    </header>
  );
}
