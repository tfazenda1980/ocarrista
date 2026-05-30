import { redirect } from "next/navigation";
import { getWorkshopSeries } from "@/app/lib/events/load-workshop";

export default function WorkshopIndexPage() {
  const { defaultYear } = getWorkshopSeries();
  redirect(`/eventos/workshop/${defaultYear}`);
}
