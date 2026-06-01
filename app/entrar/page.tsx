import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/components/auth/login-form";
import { TacticalBackground } from "@/app/components/tactical-background";
import { canAccessLoja } from "@/app/lib/auth/member-access";
import { getSession } from "@/app/lib/auth/session";

export default async function EntrarPage() {
  const session = await getSession();

  if (session.role === "admin") {
    redirect("/admin");
  }
  if (canAccessLoja(session)) {
    redirect("/?section=loja");
  }

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-md px-4 py-24 sm:px-6">
        <Link href="/" className="mb-8 inline-block font-mono text-xs text-muted hover:text-gold">
          ← Início
        </Link>
        <h1 className="font-display mb-2 text-2xl font-semibold uppercase">Login</h1>
        <p className="mb-4 text-sm text-muted">
          Acesso à Loja (membros) ou à administração do site.
        </p>
        <p className="mb-6 text-xs leading-relaxed text-muted/90">
          Membros: use o email da adesão aprovada e a password que definiu no link
          recebido por email após aprovação.{" "}
          <Link href="/#comunidade" className="text-gold hover:underline">
            Ver procedimento completo
          </Link>
          .
        </p>
        <LoginForm />
      </main>
    </>
  );
}
