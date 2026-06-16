import { redirect } from "next/navigation";
import { getChallengerSeries } from "@/app/lib/events/load-challenger";

export default function ChallengerIndexPage() {
  const series = getChallengerSeries();
  redirect(`/eventos/challenger/${series.defaultYear}`);
}
