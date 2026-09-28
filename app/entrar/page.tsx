import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/components/auth/login-form";
import { TacticalBackground } from "@/app/components/tactical-background";
import { LanguageSwitcher } from "@/app/components/i18n/language-switcher";
import { canAccessLoja } from "@/app/lib/auth/member-access";
import { getSession } from "@/app/lib/auth/session";
import { getTranslator } from "@/app/lib/i18n/get-locale";

export default async function EntrarPage() {
  const session = await getSession();
  const { t } = await getTranslator();

  if (session.role === "admin") {
    redirect("/?section=admin");
  }
  if (canAccessLoja(session)) {
    redirect("/?section=loja");
  }

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-md px-4 py-24 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs text-muted hover:text-gold">
            {t("login.back")}
          </Link>
          <LanguageSwitcher />
        </div>
        <h1 className="font-display mb-2 text-2xl font-semibold uppercase">{t("login.title")}</h1>
        <p className="mb-4 text-sm text-muted">{t("login.lead")}</p>
        <p className="mb-6 text-xs leading-relaxed text-muted/90">
          {t("login.membersHint")}{" "}
          <Link href="/#comunidade" className="text-gold hover:underline">
            {t("login.procedure")}
          </Link>
          .
        </p>
        <LoginForm />
      </main>
    </>
  );
}
