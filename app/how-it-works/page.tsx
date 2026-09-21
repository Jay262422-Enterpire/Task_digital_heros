import { NumberBall } from "@/components/number-balls";
import { TIER_SHARES } from "@/lib/config";

export const metadata = { title: "How the draw works" };

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-4xl">How the draw works</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This is a lottery built from rounds you already played. There is no extra ticket to buy.
        Eligibility is an active subscription and five stored Stableford scores.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl">Your ticket</h2>
        <p>
          Log scores from 1 to 45, each with a date. Only one score per date. We keep the latest
          five; a new round replaces the oldest. Those five numbers are what we match.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl">Two engines</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Random</strong> — five unique numbers from 1–45,
            lottery style.
          </li>
          <li>
            <strong className="text-foreground">Algorithmic</strong> — the same five unique numbers,
            but weighted toward scores that appear more often among eligible players this month.
          </li>
        </ul>
        <p>An administrator simulates a result, inspects it, then publishes. Publishing is the only step that creates winners.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl">Prize pool</h2>
        <p>
          40% of each active subscription’s monthly equivalent goes into the pool, plus any
          unclaimed 5-number jackpot from last month. Tiers are fixed:
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { n: 5, share: TIER_SHARES[5], note: "Jackpot · rolls over if no one hits it" },
            { n: 4, share: TIER_SHARES[4], note: "No rollover" },
            { n: 3, share: TIER_SHARES[3], note: "No rollover" },
          ].map((tier) => (
            <div key={tier.n} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card p-4">
              <NumberBall n={tier.n} />
              <div>
                <p className="font-medium">{Math.round(tier.share * 100)}% of the pool</p>
                <p className="text-xs text-muted-foreground">{tier.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Multiple winners in the same tier split that tier equally. Unclaimed 3- and 4-match pots
          stay with the platform; only the 5-match jackpot carries forward.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl">Charity</h2>
        <p>
          You choose a listed charity at signup and set a percentage of your fee — 10% minimum,
          up to 90%. You can raise it later. An independent donation is a separate gift. It never
          buys extra numbers.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl">If you win</h2>
        <p>
          Upload a screenshot of the scores from your golf platform. An administrator approves or
          rejects it. Payouts move from pending to paid only after verification.
        </p>
      </section>
    </div>
  );
}
