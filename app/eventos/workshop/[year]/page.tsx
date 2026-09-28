import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPageView } from "@/app/components/events/event-page";
import {
  getWorkshopEdition,
  getWorkshopSeries,
  getWorkshopYearsForStaticParams,
  isWorkshopYearValid,
} from "@/app/lib/events/load-workshop";
import { getRequestLocale } from "@/app/lib/i18n/get-locale";
import { localizeContent, pickLocalized } from "@/app/lib/i18n/localized";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateStaticParams() {
  return getWorkshopYearsForStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const locale = await getRequestLocale();
  const event = localizeContent(getWorkshopEdition(year), locale);
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
  const locale = await getRequestLocale();
  if (!isWorkshopYearValid(year)) notFound();

  const event = localizeContent(getWorkshopEdition(year), locale);
  if (!event) notFound();

  const series = getWorkshopSeries();

  return (
    <EventPageView
      event={event}
      seriesYears={series.years}
      activeYear={year}
      seriesTitle={pickLocalized(series.title, locale)}
    />
  );
}
