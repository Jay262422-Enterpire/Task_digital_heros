import Link from "next/link";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    include: { subscription: true, charityChoice: { include: { charity: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="h-9 w-full max-w-sm rounded-lg border border-input bg-input/30 px-3 text-sm"
        />
      </form>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/4 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Charity</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/8">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`} className="text-primary hover:underline">
                    {user.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {statusLabel(user.subscription?.status ?? "INACTIVE")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {user.charityChoice
                    ? `${user.charityChoice.charity.name} · ${user.charityChoice.percent}%`
                    : "—"}
                </td>
                <td className="px-4 py-3">{statusLabel(user.role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
