import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CncPageView } from "@/app/components/events/cnc/cnc-page-view";
import {
  getCncEdition,
  getCncSeries,
  getCncYearsForStaticParams,
  isCncYearValid,
} from "@/app/lib/events/load-cnc";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateStaticParams() {
  return getCncYearsForStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const event = getCncEdition(year);
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
  if (!isCncYearValid(year)) notFound();

  const event = getCncEdition(year);
  if (!event) notFound();

  const series = getCncSeries();

  return (
    <CncPageView
      event={event}
      seriesYears={series.years}
      activeYear={year}
      seriesTitle={series.title}
    />
  );
}
