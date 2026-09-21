import { cn } from "@/lib/utils";

const causeLabel: Record<string, string> = {
  junior: "Young players",
  environment: "Land & climate",
  health: "Care",
  veterans: "Service leavers",
  community: "Neighbourhood sport",
};

export function CharityCover({
  name,
  accent,
  cause,
  className,
}: {
  name: string;
  accent: string;
  cause: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex min-h-40 flex-col justify-between overflow-hidden p-5",
        className
      )}
      style={{
        background: `radial-gradient(80% 120% at 10% 20%, ${accent}66, transparent 55%),
          linear-gradient(160deg, oklch(0.22 0.04 310), oklch(0.16 0.03 310))`,
      }}
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
      <span className="text-xs uppercase tracking-[0.2em] text-white/70">
        {causeLabel[cause] ?? cause}
      </span>
      <p className="font-heading text-2xl leading-tight text-white">{name}</p>
    </div>
  );
}
