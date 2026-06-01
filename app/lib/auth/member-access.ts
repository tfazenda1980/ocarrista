import type { SessionData } from "./session";

/** Membro aprovado com sessão ativa — acesso à Loja. */
export function canAccessLoja(session: SessionData): boolean {
  return session.role === "user";
}
