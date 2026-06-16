import { AdminChallengerView } from "@/app/components/admin/admin-challenger-view";
import { AdminPageShell } from "@/app/components/admin/admin-page-shell";
import { requireAdminPage } from "@/app/lib/auth/require-admin";

type PageProps = {
  params: Promise<{ year: string }>;
};

export default async function AdminChallengerPage({ params }: PageProps) {
  await requireAdminPage();
  const { year } = await params;

  return (
    <AdminPageShell
      title={`Challenger ${year}`}
      description="Gerir provas e croquis, guarnições inscritas, pontuações e publicação das classificações provisória e final."
    >
      <AdminChallengerView year={year} />
    </AdminPageShell>
  );
}
