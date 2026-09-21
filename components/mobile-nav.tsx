"use client";

import { useRef } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav({ session }: { session: SessionUser | null }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };
  const links = [
    { href: "/how-it-works", label: "How it works" },
    { href: "/charities", label: "Charities" },
    { href: "/donate", label: "Donate" },
    session?.role === "ADMIN"
      ? { href: "/admin", label: "Admin" }
      : session
        ? { href: "/dashboard", label: "Dashboard" }
        : { href: "/login", label: "Sign in" },
  ];

  return (
    <details ref={detailsRef} className="relative md:hidden">
      <summary
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "list-none [&::-webkit-details-marker]:hidden"
        )}
      >
        <Menu />
        <span className="sr-only">Open menu</span>
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-popover p-3 shadow-2xl">
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href={session?.role === "ADMIN" ? "/admin" : session ? "/dashboard" : "/signup"}
          onClick={close}
          className={cn(buttonVariants(), "mt-3 w-full")}
        >
          {session?.role === "ADMIN" ? "Control room" : session ? "Your desk" : "Subscribe"}
        </Link>
        {session ? (
          <form action={logoutAction} className="mt-2">
            <Button variant="ghost" className="w-full" type="submit">
              Sign out
            </Button>
          </form>
        ) : null}
      </div>
    </details>
  );
}
