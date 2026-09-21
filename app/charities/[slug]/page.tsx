import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { CharityCover } from "@/components/charity-cover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CharityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const charity = await prisma.charity.findUnique({
    where: { slug },
    include: { events: { orderBy: { happensOn: "asc" } } },
  });
  if (!charity) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <CharityCover
        name={charity.name}
        accent={charity.accent}
        cause={charity.cause}
        className="min-h-56 rounded-3xl"
      />
      <h1 className="mt-8 font-heading text-4xl">{charity.name}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{charity.tagline}</p>
      <p className="mt-6 leading-7">{charity.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/signup?charity=${charity.id}`} className={cn(buttonVariants(), "rounded-full")}>
          Direct my subscription here
        </Link>
        <Link
          href={`/donate?charity=${charity.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          Make an independent gift
        </Link>
      </div>
      <h2 className="mt-12 font-heading text-2xl">Upcoming days</h2>
      {charity.events.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No public events listed yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {charity.events.map((event) => (
            <li key={event.id} className="rounded-2xl border border-white/10 bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-primary">{formatDate(event.happensOn)}</p>
              <p className="mt-1 font-heading text-xl">{event.title}</p>
              <p className="text-sm text-muted-foreground">{event.location}</p>
              <p className="mt-2 text-sm">{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
