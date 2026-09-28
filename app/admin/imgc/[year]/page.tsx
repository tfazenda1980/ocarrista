import { AdminImgcView } from "@/app/components/admin/admin-imgc-view";
import { AdminPageShell } from "@/app/components/admin/admin-page-shell";
import { requireAdminPage } from "@/app/lib/auth/require-admin";

type PageProps = {
  params: Promise<{ year: string }>;
};

export default async function AdminImgcPage({ params }: PageProps) {
  await requireAdminPage();
  const { year } = await params;

  return (
    <AdminPageShell
      title={`IMGC ${year}`}
      description="Gerir a International Master Gunner Conference: textos, delegações no mapa, programa, Tomar, galeria e sugestões."
    >
      <AdminImgcView year={year} />
    </AdminPageShell>
  );
}
