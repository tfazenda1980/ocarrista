import type { QaRoomId } from "./types";

/** Password do público — mesma para os dois debates. Predefinição: 1762 */
const DEFAULT_QA_PASSWORD = "1762";

export function audiencePassword(): string {
  return process.env.WORKSHOP_QA_PASSWORD?.trim() || DEFAULT_QA_PASSWORD;
}

/** Password da vista de moderação. Predefinição: 1762 (pode ser igual à do público) */
export function modPassword(): string {
  return (
    process.env.WORKSHOP_QA_MOD_PASSWORD?.trim() ||
    process.env.WORKSHOP_QA_PASSWORD?.trim() ||
    DEFAULT_QA_PASSWORD
  );
}

export function checkAudiencePassword(_room: QaRoomId, password: string): boolean {
  if (!password) return false;
  return password.trim() === audiencePassword();
}

export function checkModPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === modPassword();
}

/** Sempre disponível (passwords têm valor por defeito). */
export function qaConfigured(): boolean {
  return true;
}
