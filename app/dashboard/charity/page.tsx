import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { monthlyEquivalentPence, formatPence } from "@/lib/money";
import { CharityChoiceForm } from "@/components/forms/charity-choice-form";

export default async function CharityPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [choice, charities, sub] = await Promise.all([
    prisma.charityChoice.findUnique({
      where: { userId: session.id },
      include: { charity: true },
    }),
    prisma.charity.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.subscription.findUnique({ where: { userId: session.id } }),
  ]);
  const monthly =
    sub && choice
      ? Math.round(monthlyEquivalentPence(sub.plan, sub.amountPence) * (choice.percent / 100))
      : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="font-heading text-2xl">Your recipient</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {choice
            ? `${choice.percent}% of your monthly equivalent (${formatPence(monthly)}) is directed to ${choice.charity.name}. Raise it anytime; 10% is the floor.`
            : "Pick a listed charity. Signup should have set one — you can change it here."}
        </p>
        <div className="mt-6">
          <CharityChoiceForm
            charities={charities}
            charityId={choice?.charityId}
            percent={choice?.percent ?? 10}
          />
        </div>
      </div>
    </div>
  );
}
