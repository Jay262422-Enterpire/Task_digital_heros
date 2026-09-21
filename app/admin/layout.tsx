import { DashNav } from "@/components/dash-nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">Control room</p>
      <h1 className="mb-6 font-heading text-3xl">Admin</h1>
      <DashNav
        items={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/draws", label: "Draws" },
          { href: "/admin/charities", label: "Charities" },
          { href: "/admin/winners", label: "Winners" },
          { href: "/admin/reports", label: "Reports" },
        ]}
      />
      <div className="mt-8">{children}</div>
    </div>
  );
}
