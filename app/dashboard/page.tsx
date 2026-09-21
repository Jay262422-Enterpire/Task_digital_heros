import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPence, monthlyEquivalentPence } from "@/lib/money";
import { formatDate, statusLabel } from "@/lib/format";
import { refreshSubscriptionStatus, isSubscriber } from "@/lib/subscriptions";
import { NumberRow } from "@/components/number-balls";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ticketFromScores } from "@/lib/draw-engine";
import { CancelPlanButton } from "@/components/forms/cancel-plan-button";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { subscribed } = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      subscription: true,
      charityChoice: { include: { charity: true } },
      scores: { orderBy: { playedOn: "desc" } },
      wins: { include: { draw: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) redirect("/login");
  const sub = user.subscription ? await refreshSubscriptionStatus(user.id) : null;
  const active = isSubscriber(sub?.status);
  const ticket = ticketFromScores(user.scores.map((s) => s.value));
  const upcoming = await prisma.draw.findFirst({
    where: { status: { in: ["DRAFT", "SIMULATED"] } },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });
  const entered = await prisma.draw.count({
    where: { status: "PUBLISHED", wins: { some: { userId: user.id } } },
  });
  const publishedCount = await prisma.draw.count({ where: { status: "PUBLISHED" } });
  const wonTotal = user.wins.reduce((s, w) => s + w.amountPence, 0);
  const charityMonthly =
    sub && user.charityChoice
      ? Math.round(monthlyEquivalentPence(sub.plan, sub.amountPence) * (user.charityChoice.percent / 100))
      : 0;

  return (
    <div className="space-y-6">
      {subscribed ? (
        <p className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          Subscription is live. Log five scores to sit in this month’s draw.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Subscription</p>
          <p className="mt-2 font-heading text-2xl">{statusLabel(sub?.status ?? "INACTIVE")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sub
              ? `${statusLabel(sub.plan)} · renews ${formatDate(sub.renewalDate)}`
              : "No plan yet"}
            {sub?.canceledAt ? " · cancellation scheduled" : ""}
          </p>
          {active && !sub?.canceledAt ? (
            <div className="mt-3">
              <CancelPlanButton />
            </div>
          ) : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Charity</p>
          <p className="mt-2 font-heading text-2xl">
            {user.charityChoice ? `${user.charityChoice.percent}%` : "Not set"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.charityChoice
              ? `${user.charityChoice.charity.name} · ${formatPence(charityMonthly)} / month`
              : "Choose a recipient"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Winnings</p>
          <p className="mt-2 font-heading text-2xl">{formatPence(wonTotal)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.wins.length} prize{user.wins.length === 1 ? "" : "s"} ·{" "}
            {user.wins.some((w) => w.payoutStatus === "PENDING") ? "payout pending" : "no open payouts"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl">Latest five</h2>
            <Link href="/dashboard/scores" className="text-sm text-primary">
              Edit
            </Link>
          </div>
          {user.scores.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No rounds stored yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {user.scores.map((score) => (
                <li key={score.id} className="flex justify-between">
                  <span>{formatDate(score.playedOn)}</span>
                  <span className="font-medium">{score.value}</span>
                </li>
              ))}
            </ul>
          )}
          {ticket.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Ticket</p>
              <NumberRow numbers={ticket} size="sm" />
            </div>
          ) : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <h2 className="font-heading text-xl">Participation</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {active
              ? user.scores.length === 5
                ? "You are eligible for the next published draw."
                : `Enter ${5 - user.scores.length} more round${5 - user.scores.length === 1 ? "" : "s"} to become eligible.`
              : "Subscribe to enter draws."}
          </p>
          <p className="mt-3 text-sm">
            Draws published while you were a member: {publishedCount}. Recorded prizes: {entered}.
          </p>
          {upcoming ? (
            <Badge className="mt-4">Next window: {upcoming.month}/{upcoming.year}</Badge>
          ) : (
            <Badge className="mt-4" variant="secondary">
              No open draw
            </Badge>
          )}
          {!active ? (
            <Link href="/subscribe" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
              Activate plan
            </Link>
          ) : null}
        </div>
      </div>
      <ProfileForm name={user.name} />
    </div>
  );
}
