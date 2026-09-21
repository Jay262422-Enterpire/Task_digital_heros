import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 text-sm">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
