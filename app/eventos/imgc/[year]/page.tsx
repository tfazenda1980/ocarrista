import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImgcPageView } from "@/app/components/events/imgc/imgc-page-view";
import { getImgcLiveEdition } from "@/app/lib/imgc/repository";
import { getImgcSeries, isImgcYearValid } from "@/app/lib/events/load-imgc";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const event = await getImgcLiveEdition(year);
  if (!event) return { title: "IMGC | O Carrista" };
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

export default async function ImgcYearPage({ params }: PageProps) {
  const { year } = await params;
  if (!isImgcYearValid(year)) notFound();

  const event = await getImgcLiveEdition(year);
  if (!event || !event.published) notFound();

  const series = getImgcSeries();

  return (
    <ImgcPageView
      event={event}
      seriesYears={series.years}
      activeYear={year}
      seriesTitle={series.title}
    />
  );
}
