"use client";

import Link from "next/link";
import { useT } from "../i18n/locale-provider";

export function MemberAccessProcedure() {
  const { t } = useT();
  return (
    <aside className="card-tactical border-gold/25 bg-gold/5 p-6 sm:p-8">
      <p className="section-label mb-3">{t("comunidade.howTitle")}</p>
      <h3 className="font-display mb-4 text-lg font-semibold tracking-wide text-foreground uppercase">
        {t("comunidade.howSubtitle")}
      </h3>
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted">
        <li>{t("comunidade.how1")}</li>
        <li>{t("comunidade.how2")}</li>
        <li>
          {t("comunidade.how3Before")}
          <Link href="/entrar" className="text-gold hover:underline">
            {t("nav.login")}
          </Link>
          {t("comunidade.how3After")}
        </li>
      </ol>
      <p className="mt-5 border-t border-gold/15 pt-5 text-sm leading-relaxed text-muted">
        {t("comunidade.howNote")}
      </p>
    </aside>
  );
}
