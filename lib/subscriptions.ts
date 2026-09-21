import { prisma } from "./db";

export async function refreshSubscriptionStatus(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return null;
  const now = new Date();
  if (sub.status === "ACTIVE" && sub.renewalDate.getTime() < now.getTime()) {
    const nextStatus = sub.canceledAt ? "CANCELED" : "LAPSED";
    return prisma.subscription.update({
      where: { id: sub.id },
      data: { status: nextStatus },
    });
  }
  return sub;
}

export function isSubscriber(status: string | undefined | null): boolean {
  return status === "ACTIVE";
}
