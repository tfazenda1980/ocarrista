import { redirect } from "next/navigation";

export default function AdminPerguntasRedirectPage() {
  redirect("/?section=admin-perguntas");
}
