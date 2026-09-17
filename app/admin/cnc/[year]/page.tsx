import { AdminCncView } from "@/app/components/admin/admin-cnc-view";
import { AdminPageShell } from "@/app/components/admin/admin-page-shell";
import { requireAdminPage } from "@/app/lib/auth/require-admin";

type PageProps = {
  params: Promise<{ year: string }>;
};

export default async function AdminCncPage({ params }: PageProps) {
  await requireAdminPage();
  const { year } = await params;

  return (
    <AdminPageShell
      title={`CNC ${year}`}
      description="Gerir nota de abertura, programa, provas, croquis, PDFs, informação útil e contactos apresentados ao público e aos concorrentes."
    >
      <AdminCncView year={year} />
    </AdminPageShell>
  );
}
