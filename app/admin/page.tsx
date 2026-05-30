import Link from "next/link";
import { AdminNav } from "@/app/components/admin/admin-nav";
import { requireAdminPage } from "@/app/lib/auth/require-admin";
import { listMembersByStatus } from "@/app/lib/members/repository";
import { TacticalBackground } from "@/app/components/tactical-background";

export default async function AdminHomePage() {
  await requireAdminPage();
  const pending = await listMembersByStatus("pending");

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <AdminNav />
        <h1 className="font-display mb-6 text-2xl font-semibold uppercase">Administração</h1>
        <p className="mb-8 text-muted">
          Conta única de administrador. Password global na Vercel — não é membro na base de
          dados.
        </p>
        <div className="card-tactical p-6">
          <p className="text-3xl font-bold text-gold">{pending.length}</p>
          <p className="text-sm text-muted">Pedidos de adesão pendentes</p>
          <Link href="/admin/adesoes" className="btn-primary mt-4 inline-flex text-xs">
            Ver adesões
          </Link>
        </div>
      </main>
    </>
  );
}
