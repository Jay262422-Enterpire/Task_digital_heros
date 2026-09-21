"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileNav({ session }: { session: SessionUser | null }) {
  const [open, setOpen] = useState(false);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
        <Menu />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>digital.HEROES</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-sm hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={session ? "/subscribe" : "/signup"}
            onClick={() => setOpen(false)}
            className={cn(buttonVariants(), "mt-2")}
          >
            Subscribe
          </Link>
          {session ? (
            <form action={logoutAction}>
              <Button variant="ghost" className="w-full" type="submit">
                Sign out
              </Button>
            </form>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
