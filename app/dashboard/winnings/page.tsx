import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPence } from "@/lib/money";
import { formatDate, statusLabel } from "@/lib/format";
import { monthLabel } from "@/lib/prize-pool";
import { ProofForm } from "@/components/forms/proof-form";
import { Badge } from "@/components/ui/badge";

export default async function WinningsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const wins = await prisma.win.findMany({
    where: { userId: session.id },
    include: { draw: true },
    orderBy: { createdAt: "desc" },
  });
  const total = wins.reduce((s, w) => s + w.amountPence, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl">Winnings</h2>
        <p className="mt-1 text-muted-foreground">Total recorded: {formatPence(total)}</p>
      </div>
      {wins.length === 0 ? (
        <p className="text-muted-foreground">No prizes yet. Keep five live scores in the book.</p>
      ) : (
        <ul className="space-y-4">
          {wins.map((win) => (
            <li key={win.id} className="rounded-2xl border border-white/10 bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-xl">
                  {monthLabel(win.draw.year, win.draw.month)} · {win.matchCount}-number match
                </p>
                <p className="font-medium">{formatPence(win.amountPence)}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{statusLabel(win.payoutStatus)}</Badge>
                <Badge variant="secondary">{statusLabel(win.proofStatus)}</Badge>
              </div>
              {win.proofStatus !== "APPROVED" ? (
                <div className="mt-4">
                  <ProofForm winId={win.id} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Verified {win.reviewedAt ? formatDate(win.reviewedAt) : ""}.{" "}
                  {win.payoutStatus === "PAID" ? "Payout marked paid." : "Awaiting payout."}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
