import { AdminAdesoesPanel } from "@/app/components/admin/admin-adesoes-panel";
import { AdminNav } from "@/app/components/admin/admin-nav";
import { requireAdminPage } from "@/app/lib/auth/require-admin";
import { TacticalBackground } from "@/app/components/tactical-background";

export default async function AdminAdesoesPage() {
  await requireAdminPage();

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <AdminNav />
        <h1 className="font-display mb-8 text-2xl font-semibold uppercase">Adesões</h1>
        <AdminAdesoesPanel />
      </main>
    </>
  );
}
