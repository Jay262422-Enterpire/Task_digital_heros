import { prisma } from "@/lib/db";
import { SignupForm } from "@/components/forms/signup-form";

export const metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ charity?: string }>;
}) {
  const { charity } = await searchParams;
  const charities = await prisma.charity.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl">Join the draw</h1>
      <p className="mt-2 text-muted-foreground">
        Pick a charity before you pay. You can raise the percentage later; you cannot drop it below 10%.
      </p>
      <div className="mt-8">
        <SignupForm charities={charities} defaultCharityId={charity} />
      </div>
    </div>
  );
}
