import Link from "next/link";

export const dynamic = "force-dynamic";
import { DashNav } from "@/components/dash-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Player panel</p>
          <h1 className="font-heading text-3xl">Your desk</h1>
        </div>
        <Link href="/subscribe" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Plan
        </Link>
      </div>
      <DashNav
        items={[
          { href: "/dashboard", label: "Overview" },
          { href: "/dashboard/scores", label: "Scores" },
          { href: "/dashboard/charity", label: "Charity" },
          { href: "/dashboard/draws", label: "Draws" },
          { href: "/dashboard/winnings", label: "Winnings" },
        ]}
      />
      <div className="mt-8">{children}</div>
    </div>
  );
}
