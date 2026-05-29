import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPageView } from "@/app/components/events/event-page";
import {
  getEventBySlug,
  getEventSlugsForStaticParams,
} from "@/app/lib/events/load-event";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getEventSlugsForStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Evento | O Carrista" };
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

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return <EventPageView event={event} />;
}
