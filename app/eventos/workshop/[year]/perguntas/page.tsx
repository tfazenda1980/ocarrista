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

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const event = getWorkshopEdition(year);
  if (!event) return { title: "Perguntas | O Carrista" };
  return {
    title: `Perguntas ao debate — Workshop ${year} | O Carrista`,
    description: "Envie uma pergunta para a sessão de debate do Workshop.",
    robots: { index: false, follow: false },
  };
}

export default async function WorkshopPerguntasPage({ params }: PageProps) {
  const { year } = await params;
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
        <Suspense fallback={<p className="text-muted">A carregar…</p>}>
          <WorkshopQaAudience year={year} />
        </Suspense>
      </main>
    </>
  );
}
