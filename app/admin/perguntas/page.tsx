import { AdminNav } from "@/app/components/admin/admin-nav";
import { AdminQaPanel } from "@/app/components/admin/admin-qa-panel";
import { requireAdminPage } from "@/app/lib/auth/require-admin";
import { TacticalBackground } from "@/app/components/tactical-background";

export default async function AdminPerguntasPage() {
  await requireAdminPage();
  const year = "2026";

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <AdminNav />
        <h1 className="font-display mb-8 text-2xl font-semibold uppercase">
          Perguntas — Workshop {year}
        </h1>
        <AdminQaPanel year={year} />
      </main>
    </>
  );
}
