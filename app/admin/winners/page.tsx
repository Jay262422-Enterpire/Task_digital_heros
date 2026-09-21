import { prisma } from "@/lib/db";
import { formatPence } from "@/lib/money";
import { formatDate, statusLabel } from "@/lib/format";
import { monthLabel } from "@/lib/prize-pool";
import { Badge } from "@/components/ui/badge";
import { ReviewForm, MarkPaidButton } from "@/components/forms/review-form";

export default async function AdminWinnersPage() {
  const wins = await prisma.win.findMany({
    include: { user: true, draw: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      {wins.length === 0 ? (
        <p className="text-muted-foreground">No winners recorded yet. Publish a draw first.</p>
      ) : (
        wins.map((win) => (
          <article key={win.id} className="rounded-2xl border border-white/10 bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl">{win.user.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {win.user.email} · {monthLabel(win.draw.year, win.draw.month)} · {win.matchCount} match
                </p>
              </div>
              <p className="font-medium">{formatPence(win.amountPence)}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{statusLabel(win.payoutStatus)}</Badge>
              <Badge variant="secondary">{statusLabel(win.proofStatus)}</Badge>
            </div>
            {win.proofPath ? (
              <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={win.proofPath} alt="Submitted proof" className="mx-auto max-h-56 object-contain" />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No screenshot uploaded yet.</p>
            )}
            {win.proofNote ? (
              <p className="mt-2 text-sm text-muted-foreground">Note: {win.proofNote}</p>
            ) : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ReviewForm winId={win.id} />
              {win.proofStatus === "APPROVED" && win.payoutStatus !== "PAID" ? (
                <MarkPaidButton winId={win.id} />
              ) : win.paidAt ? (
                <p className="text-sm text-muted-foreground">Paid {formatDate(win.paidAt)}</p>
              ) : null}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
