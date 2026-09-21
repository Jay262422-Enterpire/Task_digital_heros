import { cn } from "@/lib/utils";

export function NumberBall({
  n,
  size = "md",
  glow = false,
}: {
  n: number;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}) {
  const dim =
    size === "lg" ? "size-14 text-xl" : size === "sm" ? "size-8 text-xs" : "size-11 text-sm";
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full border border-primary/40 bg-gradient-to-b from-primary/30 to-primary/5 font-semibold text-primary",
        glow && "shadow-[0_0_24px_oklch(0.84_0.12_82_/_0.35)]",
        dim
      )}
    >
      {n}
    </span>
  );
}

export function NumberRow({
  numbers,
  size = "md",
}: {
  numbers: number[];
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {numbers.map((n) => (
        <NumberBall key={n} n={n} size={size} glow />
      ))}
    </div>
  );
}
