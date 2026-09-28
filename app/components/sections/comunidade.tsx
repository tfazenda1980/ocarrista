import Link from "next/link";
import { SectionShell } from "../section-shell";
import { IconUsers, IconShop, IconShield } from "../icons";
import { ComunidadeJoinForm } from "../comunidade/comunidade-join-form";
import { MemberAccessProcedure } from "../comunidade/member-access-procedure";
import type { ComunidadeView } from "@/app/lib/auth/member-access";
import { getTranslator, type Translator } from "@/app/lib/i18n/get-locale";
import type { Messages } from "@/app/lib/i18n/messages";

type ComunidadeSectionProps = {
  view: ComunidadeView;
  memberName?: string;
  showGesco?: boolean;
};

function ComunidadeGuest({ t, messages }: { t: Translator; messages: Messages }) {
  return (
    <>
      <div className="mb-10">
        <MemberAccessProcedure />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="card-tactical corner-brackets relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -right-8 -top-8 h-32 w-32 border border-gold/10 rotate-45 opacity-50" />
          <div className="mb-6 flex h-14 w-14 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
            <IconUsers />
          </div>
          <h3 className="font-display mb-2 text-2xl font-semibold tracking-wide uppercase">
            {t("comunidade.newMember")}
          </h3>
          <p className="mb-8 text-muted leading-relaxed">{t("comunidade.newMemberBody")}</p>
          <ComunidadeJoinForm />
        </div>

        <div className="flex flex-col gap-8">
          <ul className="space-y-5">
            {messages.comunidade.benefits.map((benefit, i) => (
              <li key={benefit} className="flex gap-4">
                <span className="font-display shrink-0 text-lg font-bold text-gold/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-base text-foreground">{benefit}</p>
              </li>
            ))}
          </ul>

          <div className="card-tactical flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
                <IconShop />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
                  {t("comunidade.alreadyMember")}
                </h4>
                <p className="mt-1 text-sm text-muted">{t("comunidade.alreadyMemberBody")}</p>
              </div>
            </div>
            <Link href="/entrar" className="btn-outline shrink-0 text-center">
              {t("nav.login")}
            </Link>
          </div>

          <ComunidadeQuote t={t} />
        </div>
      </div>
    </>
  );
}

function ComunidadeQuote({ t }: { t: Translator }) {
  return (
    <blockquote className="border-l-2 border-gold/50 pl-6">
      <p className="text-lg italic text-muted leading-relaxed">
        &ldquo;{t("comunidade.quote")}&rdquo;
      </p>
      <footer className="mt-3 font-display text-xs tracking-[0.2em] text-gold uppercase">
        — {t("brand.name")}
      </footer>
    </blockquote>
  );
}

function ComunidadeMember({
  memberName,
  showGesco,
  t,
}: {
  memberName?: string;
  showGesco?: boolean;
  t: Translator;
}) {
  const greeting = memberName?.trim()
    ? t("comunidade.hello", { name: memberName })
    : t("comunidade.memberSession");

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="card-tactical p-8 sm:p-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
          <IconUsers />
        </div>
        <h3 className="font-display mb-2 text-2xl font-semibold tracking-wide uppercase">
          {greeting}
        </h3>
        <p className="mb-6 text-muted leading-relaxed">{t("comunidade.memberBody")}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="#loja" className="btn-primary">
            {t("comunidade.goShop")}
          </Link>
          {showGesco && (
            <Link href="#gesco" className="btn-outline">
              {t("nav.gesco")}
            </Link>
          )}
          <Link href="#eventos" className="btn-outline">
            {t("comunidade.viewEvents")}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <ul className="space-y-4 text-sm text-muted">
          <li className="flex gap-3">
            <span className="text-gold">✓</span>
            <span>{t("comunidade.perkShop")}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold">✓</span>
            <span>{t("comunidade.perkAgenda")}</span>
          </li>
          {showGesco && (
            <li className="flex gap-3">
              <span className="text-gold">✓</span>
              <span>{t("comunidade.perkGesco")}</span>
            </li>
          )}
          <li className="flex gap-3">
            <span className="text-gold">✓</span>
            <span>{t("comunidade.perkLogout")}</span>
          </li>
        </ul>
        <ComunidadeQuote t={t} />
      </div>
    </div>
  );
}

function ComunidadeAdmin({ t }: { t: Translator }) {
  return (
    <div className="card-tactical max-w-2xl p-8 sm:p-10">
      <div className="mb-6 flex h-14 w-14 items-center justify-center border border-gold/40 bg-gold/5 text-gold">
        <IconShield />
      </div>
      <h3 className="font-display mb-2 text-2xl font-semibold tracking-wide uppercase">
        {t("comunidade.adminSession")}
      </h3>
      <p className="mb-6 text-muted leading-relaxed">{t("comunidade.adminBody")}</p>
      <Link href="#admin" className="btn-primary inline-flex">
        {t("comunidade.goPanel")}
      </Link>
    </div>
  );
}

export async function ComunidadeSection({
  view,
  memberName,
  showGesco,
}: ComunidadeSectionProps) {
  const { t, messages } = await getTranslator();
  const copy =
    view === "guest"
      ? {
          label: t("comunidade.guestLabel"),
          title: t("comunidade.guestTitle"),
          description: t("comunidade.guestDescription"),
        }
      : view === "member"
        ? {
            label: t("comunidade.memberLabel"),
            title: t("comunidade.memberTitle"),
            description: t("comunidade.memberDescription"),
          }
        : {
            label: t("comunidade.adminLabel"),
            title: t("comunidade.adminTitle"),
            description: t("comunidade.adminDescription"),
          };

  return (
    <SectionShell
      id="comunidade"
      label={copy.label}
      title={copy.title}
      description={copy.description}
      alt
    >
      {view === "guest" && <ComunidadeGuest t={t} messages={messages} />}
      {view === "member" && (
        <ComunidadeMember memberName={memberName} showGesco={showGesco} t={t} />
      )}
      {view === "admin" && <ComunidadeAdmin t={t} />}
    </SectionShell>
  );
}
