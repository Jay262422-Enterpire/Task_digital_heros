import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { refreshSubscriptionStatus, isSubscriber } from "@/lib/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Payment submitted" };

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/subscribe/success");
  await searchParams;
  const sub = await refreshSubscriptionStatus(session.id);
  if (isSubscriber(sub?.status)) {
    redirect("/dashboard?subscribed=1");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-4xl">Confirming payment</h1>
      <p className="mt-4 text-muted-foreground">
        Stripe has your checkout. This page does not switch the plan on by itself — that happens
        when the payment webhook arrives. Refresh in a few seconds, or open your desk.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/subscribe/success" className={cn(buttonVariants(), "rounded-full")}>
          Refresh status
        </Link>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
          Your desk
        </Link>
      </div>
    </div>
  );
}
