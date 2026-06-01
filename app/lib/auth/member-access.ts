import type { SessionData } from "./session";

export type ComunidadeView = "guest" | "member" | "admin";

/** Membro aprovado com sessão ativa — acesso à Loja. */
export function canAccessLoja(session: SessionData): boolean {
  return session.role === "user";
}

export function comunidadeView(session: SessionData): ComunidadeView {
  if (session.role === "admin") return "admin";
  if (session.role === "user") return "member";
  return "guest";
}
