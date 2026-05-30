import { redirect } from "next/navigation";
import { isWorkshopYearValid } from "@/app/lib/events/load-workshop";

type PageProps = {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ sala?: string; room?: string }>;
};

/** Redireciona para a página única de perguntas (sem perfil de moderador). */
export default async function WorkshopModeradorRedirect({
  params,
  searchParams,
}: PageProps) {
  const { year } = await params;
  if (!isWorkshopYearValid(year)) {
    redirect("/eventos/workshop");
  }
  const q = await searchParams;
  const sala = q.sala ?? q.room;
  const query = sala ? `?sala=${encodeURIComponent(sala)}` : "";
  redirect(`/eventos/workshop/${year}/perguntas${query}`);
}
