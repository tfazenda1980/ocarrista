import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengerPageView } from "@/app/components/events/challenger/challenger-page-view";
import { getChallengerLiveData } from "@/app/lib/challenger/repository";
import {
  getChallengerEdition,
  getChallengerSeries,
  isChallengerYearValid,
} from "@/app/lib/events/load-challenger";
import { getRequestLocale } from "@/app/lib/i18n/get-locale";
import { localizeContent } from "@/app/lib/i18n/localized";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const locale = await getRequestLocale();
  const event = localizeContent(getChallengerEdition(year), locale);
  if (!event) return { title: "Challenger | O Carrista" };
  return {
    title: event.seo.title,
    description: event.seo.description,
    openGraph: {
      title: event.seo.title,
      description: event.seo.description,
      type: "website",
    },
  };
}

export default async function ChallengerYearPage({ params }: PageProps) {
  const { year } = await params;
  const locale = await getRequestLocale();
  if (!isChallengerYearValid(year)) notFound();

  const event = localizeContent(getChallengerEdition(year), locale);
  if (!event || !event.published) notFound();

  const series = getChallengerSeries();
  const live = await getChallengerLiveData(year);

  return (
    <ChallengerPageView
      event={event}
      live={live}
      seriesYears={series.years}
      activeYear={year}
    />
  );
}
