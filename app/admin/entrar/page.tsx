import { AdminLoginForm } from "@/app/components/admin/admin-login-form";
import { TacticalBackground } from "@/app/components/tactical-background";

export default function AdminEntrarPage() {
  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <p className="section-label mb-2">Administração</p>
        <h1 className="font-display mb-8 text-2xl font-semibold uppercase">Entrar</h1>
        <AdminLoginForm />
      </main>
    </>
  );
}
