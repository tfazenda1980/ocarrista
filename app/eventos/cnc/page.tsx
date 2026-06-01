import { redirect } from "next/navigation";
import { getCncSeries } from "@/app/lib/events/load-cnc";

export default function CncIndexPage() {
  const series = getCncSeries();
  redirect(`/eventos/cnc/${series.defaultYear}`);
}
