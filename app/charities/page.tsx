import Link from "next/link";
import { prisma } from "@/lib/db";
import { CharityCover } from "@/components/charity-cover";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const causes = [
  { id: "all", label: "All" },
  { id: "junior", label: "Young players" },
  { id: "environment", label: "Land & climate" },
  { id: "health", label: "Care" },
  { id: "veterans", label: "Service leavers" },
  { id: "community", label: "Neighbourhood" },
];

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cause?: string }>;
}) {
  const { q = "", cause = "all" } = await searchParams;
  const charities = await prisma.charity.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    include: { _count: { select: { choices: true, donations: true } } },
  });
  const filtered = charities.filter((c) => {
    const hay = `${c.name} ${c.tagline} ${c.description}`.toLowerCase();
    const matchesQuery = !q || hay.includes(q.toLowerCase());
    const matchesCause = cause === "all" || c.cause === cause;
    return matchesQuery && matchesCause;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-4xl">Charity directory</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every subscriber picks one recipient and a percentage. Independent gifts sit beside that
        share — they are not tickets and they do not enter the draw.
      </p>
      <form className="mt-8 flex flex-col gap-3 sm:flex-row" action="/charities">
        <Input name="q" defaultValue={q} placeholder="Search names or stories" className="h-10" />
        <select
          name="cause"
          defaultValue={cause}
          className="h-10 rounded-lg border border-input bg-input/30 px-3 text-sm"
        >
          {causes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="submit" className={cn(buttonVariants(), "h-10")}>
          Filter
        </button>
      </form>
      {filtered.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No charities match that search. Clear the filters and try again.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((charity) => (
            <Link
              key={charity.id}
              href={`/charities/${charity.slug}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-card transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <CharityCover name={charity.name} accent={charity.accent} cause={charity.cause} />
              <div className="p-5">
                <p className="text-sm text-muted-foreground">{charity.tagline}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {charity._count.choices} subscribers · {charity._count.donations} gifts
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
