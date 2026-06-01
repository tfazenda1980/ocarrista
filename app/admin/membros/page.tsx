import { AdminMembersView } from "@/app/components/admin/admin-members-view";
import { AdminPageShell } from "@/app/components/admin/admin-page-shell";
import { requireAdminPage } from "@/app/lib/auth/require-admin";

type PageProps = {
  searchParams: Promise<{ filtro?: string }>;
};

export default async function AdminMembrosPage({ searchParams }: PageProps) {
  await requireAdminPage();
  const { filtro } = await searchParams;

  return (
    <AdminPageShell
      title="Membros da comunidade"
      description="Lista completa de inscrições: aprovar pedidos, editar dados, enviar mensagens por email, permissão GesCO e eliminar registos."
    >
      <AdminMembersView initialFilter={filtro} />
    </AdminPageShell>
  );
}
