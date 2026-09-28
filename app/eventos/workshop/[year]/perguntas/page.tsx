import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TacticalBackground } from "@/app/components/tactical-background";
import { StickyBackLink } from "@/app/components/sticky-back-link";
import { WorkshopQaAudience } from "@/app/components/workshop-qa/workshop-qa-audience";
import {
  getWorkshopEdition,
  isWorkshopYearValid,
} from "@/app/lib/events/load-workshop";
import { getTranslator } from "@/app/lib/i18n/get-locale";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const { t } = await getTranslator();
  const event = getWorkshopEdition(year);
  if (!event) return { title: t("workshop.questionsMeta") };
  return {
    title: t("workshop.questionsTitle", { year }),
    description: t("workshop.questionsDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function WorkshopPerguntasPage({ params }: PageProps) {
  const { year } = await params;
  const { t } = await getTranslator();
  if (!isWorkshopYearValid(year)) notFound();
  const event = getWorkshopEdition(year);
  if (!event || event.published === false) notFound();

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 min-h-[100dvh] px-4 py-24 sm:px-6">
        <StickyBackLink
          href={`/eventos/workshop/${year}`}
          label="Workshop"
          variant="default"
        />
        <Suspense fallback={<p className="text-muted">{t("password.loading")}</p>}>
          <WorkshopQaAudience year={year} />
        </Suspense>
      </main>
    </>
  );
}
