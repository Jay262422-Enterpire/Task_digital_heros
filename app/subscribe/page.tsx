import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/config";
import { refreshSubscriptionStatus, isSubscriber } from "@/lib/subscriptions";
import { SubscribeForm } from "@/components/forms/subscribe-form";

export const metadata = { title: "Subscribe" };

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/subscribe");
  const sub = await refreshSubscriptionStatus(session.id);
  const { from } = await searchParams;
  const choice = await prisma.charityChoice.findUnique({
    where: { userId: session.id },
    include: { charity: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl">Choose a plan</h1>
      <p className="mt-3 text-muted-foreground">
        {from === "signup"
          ? "Account created. Activate a plan to enter scores and the monthly draw."
          : "Monthly or yearly. Yearly is 25% off."}
        {choice ? ` ${choice.percent}% of the fee goes to ${choice.charity.name}.` : ""}
      </p>
      {isSubscriber(sub?.status) ? (
        <p className="mt-8 rounded-2xl border border-primary/30 bg-primary/10 p-5">
          Your {sub?.plan.toLowerCase()} plan is already active until{" "}
          {sub?.renewalDate.toLocaleDateString("en-GB")}.
        </p>
      ) : (
        <div className="mt-10">
          <SubscribeForm
            plans={[
              {
                id: PLANS.MONTHLY.id,
                label: PLANS.MONTHLY.label,
                amountPence: PLANS.MONTHLY.amountPence,
                note: "Billed every month. Cancel anytime; you stay in until the renewal date.",
              },
              {
                id: PLANS.YEARLY.id,
                label: PLANS.YEARLY.label,
                amountPence: PLANS.YEARLY.amountPence,
                note: "£108 instead of £144. One payment, twelve draws.",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
