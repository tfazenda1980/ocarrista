import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TacticalBackground } from "@/app/components/tactical-background";
import { WorkshopQaModerator } from "@/app/components/workshop-qa/workshop-qa-moderator";
import {
  getWorkshopEdition,
  isWorkshopYearValid,
} from "@/app/lib/events/load-workshop";

type PageProps = {
  params: Promise<{ year: string }>;
};

export const metadata: Metadata = {
  title: "Moderação de perguntas | O Carrista",
  robots: { index: false, follow: false },
};

export default async function WorkshopModeradorPage({ params }: PageProps) {
  const { year } = await params;
  if (!isWorkshopYearValid(year)) notFound();
  const event = getWorkshopEdition(year);
  if (!event || event.published === false) notFound();

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 min-h-[100dvh] px-4 py-24 sm:px-6">
        <WorkshopQaModerator year={year} />
      </main>
    </>
  );
}
