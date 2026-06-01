import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAdminPage() {
  const session = await getSession();
  if (session.role !== "admin") {
    redirect("/entrar");
  }
  return session;
}
