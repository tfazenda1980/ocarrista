import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EventPageView } from "@/app/components/events/event-page";
import {
  getWorkshopEdition,
  getWorkshopSeries,
  getWorkshopYearsForStaticParams,
  isWorkshopYearValid,
} from "@/app/lib/events/load-workshop";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateStaticParams() {
  return getWorkshopYearsForStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const event = getWorkshopEdition(year);
  if (!event) return { title: "Workshop | O Carrista" };
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

export default async function WorkshopYearPage({ params }: PageProps) {
  const { year } = await params;
  if (!isWorkshopYearValid(year)) notFound();

  const event = getWorkshopEdition(year);
  if (!event) notFound();

  const series = getWorkshopSeries();

  return (
    <EventPageView
      event={event}
      seriesYears={series.years}
      activeYear={year}
      seriesTitle={series.title}
    />
  );
}
