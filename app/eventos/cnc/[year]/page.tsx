import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CncPageView } from "@/app/components/events/cnc/cnc-page-view";
import { getCncLiveEdition } from "@/app/lib/cnc/repository";
import { getCncSeries, isCncYearValid } from "@/app/lib/events/load-cnc";
import { getRequestLocale } from "@/app/lib/i18n/get-locale";
import { localizeContent, pickLocalized } from "@/app/lib/i18n/localized";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const locale = await getRequestLocale();
  const event = localizeContent(await getCncLiveEdition(year), locale);
  if (!event) return { title: "CNC | O Carrista" };
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

export default async function CncYearPage({ params }: PageProps) {
  const { year } = await params;
  const locale = await getRequestLocale();
  if (!isCncYearValid(year)) notFound();

  const event = localizeContent(await getCncLiveEdition(year), locale);
  if (!event || !event.published) notFound();

  const series = getCncSeries();

  return (
    <CncPageView
      event={event}
      seriesYears={series.years}
      activeYear={year}
      seriesTitle={pickLocalized(series.title, locale)}
    />
  );
}
