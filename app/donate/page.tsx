import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DonateForm } from "@/components/forms/donate-form";

export const metadata = { title: "Independent donation" };

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ charity?: string }>;
}) {
  const session = await getSession();
  const { charity } = await searchParams;
  const charities = await prisma.charity.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl">Give without playing</h1>
      <p className="mt-3 text-muted-foreground">
        This gift is not tied to the draw. It does not change your ticket, your scores, or your
        prize eligibility.
      </p>
      <div className="mt-8">
        <DonateForm
          charities={charities}
          defaultCharityId={charity}
          email={session?.email}
        />
      </div>
    </div>
  );
}
