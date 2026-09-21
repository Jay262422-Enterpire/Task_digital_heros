import Link from "next/link";
import { HeartHandshake, Sparkles, Ticket, Trophy } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPence } from "@/lib/money";
import { activePrizePoolPence } from "@/lib/prize-pool";
import { charityContributionThisMonth } from "@/lib/queries";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CharityCover } from "@/components/charity-cover";
import { NumberRow } from "@/components/number-balls";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [featured, pool, charityPence, subscriberCount, published] = await Promise.all([
    prisma.charity.findFirst({
      where: { featured: true },
      include: { events: { orderBy: { happensOn: "asc" }, take: 1 } },
    }),
    activePrizePoolPence(),
    charityContributionThisMonth(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.draw.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
  ]);

  const lastNumbers = published ? (JSON.parse(published.numbersJson) as number[]) : [12, 24, 31, 38, 41];

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-primary">
          Charity first. Scores second. Fairway never.
        </p>
        <h1 className="max-w-3xl font-heading text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          Your round can pay a nurse, kit a junior, and still win the month.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Digital Heroes is a subscription draw. Enter five Stableford scores. Direct at least 10%
          of your fee to a cause you pick. Forty percent of every active subscription funds the
          prize pool. Nobody here is selling a country club.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-6")}>
            Subscribe this month
          </Link>
          <Link
            href="/how-it-works"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 rounded-full px-6")}
          >
            See the draw
          </Link>
        </div>
        <dl className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { label: "This month’s prize pool", value: formatPence(pool.totalPence) },
            { label: "Charity share in motion", value: formatPence(charityPence) },
            { label: "Active subscribers", value: String(subscriberCount) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/4 p-5">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</dt>
              <dd className="mt-2 font-heading text-3xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <Card className="bg-white/4 ring-white/10">
          <CardContent className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Featured cause</p>
            {featured ? (
              <>
                <CharityCover
                  name={featured.name}
                  accent={featured.accent}
                  cause={featured.cause}
                  className="-mx-4 rounded-none sm:mx-0 sm:rounded-xl"
                />
                <h2 className="font-heading text-3xl">{featured.tagline}</h2>
                <p className="text-muted-foreground">{featured.description}</p>
                <Link href={`/charities/${featured.slug}`} className={cn(buttonVariants({ variant: "secondary" }), "w-fit")}>
                  Meet {featured.name}
                </Link>
              </>
            ) : null}
          </CardContent>
        </Card>
        <Card className="bg-white/4 ring-white/10">
          <CardContent className="flex flex-col gap-5">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Last published numbers</p>
            <NumberRow numbers={lastNumbers} size="lg" />
            <p className="text-muted-foreground">
              Match 5 for the jackpot, 4 for the second tier, 3 for the third. Your ticket is the
              five Stableford scores you already played — not a set of balls you bought.
            </p>
            <Link href="/how-it-works" className="text-sm text-primary underline-offset-4 hover:underline">
              Full mechanics →
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="font-heading text-3xl sm:text-4xl">What you actually do</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            {
              icon: HeartHandshake,
              title: "Subscribe",
              body: "Monthly £12 or yearly £108. At least 10% is already earmarked for charity.",
            },
            {
              icon: Sparkles,
              title: "Log five scores",
              body: "Stableford 1–45, one round per date. The latest five are your ticket.",
            },
            {
              icon: Ticket,
              title: "Sit in the draw",
              body: "Random lottery or score-weighted. Admin simulates, then publishes.",
            },
            {
              icon: Trophy,
              title: "Prove a win",
              body: "Upload a screenshot. We verify. Payout moves from pending to paid.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-card/80 p-5">
              <step.icon className="mb-4 size-5 text-primary" />
              <h3 className="font-heading text-xl">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
