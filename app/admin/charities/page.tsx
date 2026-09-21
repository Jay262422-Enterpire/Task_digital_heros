import { prisma } from "@/lib/db";
import { CharityAdminForm, DeleteCharityButton, EventForm } from "@/components/forms/charity-admin-form";

export default async function AdminCharitiesPage() {
  const charities = await prisma.charity.findMany({
    orderBy: { name: "asc" },
    include: { events: true },
  });
  return (
    <div className="space-y-8">
      <CharityAdminForm />
      {charities.map((charity) => (
        <div key={charity.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading text-2xl">{charity.name}</h2>
            <DeleteCharityButton id={charity.id} />
          </div>
          <CharityAdminForm charity={charity} />
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-sm font-medium">Events ({charity.events.length})</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              {charity.events.map((event) => (
                <li key={event.id}>
                  {event.title} — {event.location}
                </li>
              ))}
            </ul>
            <EventForm charityId={charity.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
