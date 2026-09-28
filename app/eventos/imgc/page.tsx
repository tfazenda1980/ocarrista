import { redirect } from "next/navigation";
import { getImgcSeries } from "@/app/lib/events/load-imgc";

export default function ImgcIndexPage() {
  const series = getImgcSeries();
  redirect(`/eventos/imgc/${series.defaultYear}`);
}
