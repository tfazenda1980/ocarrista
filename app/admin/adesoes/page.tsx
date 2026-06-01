import { redirect } from "next/navigation";

export default function AdminAdesoesRedirectPage() {
  redirect("/admin/membros?filtro=pending");
}
