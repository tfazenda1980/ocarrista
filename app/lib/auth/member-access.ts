import type { SessionData } from "./session";

export type ComunidadeView = "guest" | "member" | "admin";

/** Membro aprovado com sessão ativa — acesso à Loja. */
export function canAccessLoja(session: SessionData): boolean {
  return session.role === "user";
}

/** Membro com autorização GesCO concedida pelo administrador na adesão. */
export function canAccessGesco(session: SessionData): boolean {
  return session.role === "user" && session.gescoAccess === true;
}

export function comunidadeView(session: SessionData): ComunidadeView {
  if (session.role === "admin") return "admin";
  if (session.role === "user") return "member";
  return "guest";
}
