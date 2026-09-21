import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubscriberGate({
  active,
  children,
  message,
}: {
  active: boolean;
  children: React.ReactNode;
  message?: string;
}) {
  if (active) return <>{children}</>;
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6">
      <h2 className="font-heading text-2xl">This desk is locked</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ??
          "Score entry, draws, and winnings need an active subscription. You can still pick a charity."}
      </p>
      <Link href="/subscribe" className={cn(buttonVariants(), "mt-4")}>
        Subscribe
      </Link>
    </div>
  );
}
