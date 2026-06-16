import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengerPageView } from "@/app/components/events/challenger/challenger-page-view";
import { getChallengerLiveData } from "@/app/lib/challenger/repository";
import {
  getChallengerEdition,
  getChallengerSeries,
  getChallengerYearsForStaticParams,
  isChallengerYearValid,
} from "@/app/lib/events/load-challenger";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateStaticParams() {
  return getChallengerYearsForStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const event = getChallengerEdition(year);
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
  if (!isChallengerYearValid(year)) notFound();

  const event = getChallengerEdition(year);
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
