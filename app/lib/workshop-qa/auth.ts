import type { QaRoomId } from "./types";

/** Password do workshop — mesma para ler e enviar. Predefinição: 1762 */
const DEFAULT_QA_PASSWORD = "1762";

export function workshopQaPassword(): string {
  return process.env.WORKSHOP_QA_PASSWORD?.trim() || DEFAULT_QA_PASSWORD;
}

export function checkWorkshopQaPassword(_room: QaRoomId, password: string): boolean {
  if (!password) return false;
  return password.trim() === workshopQaPassword();
}

export function qaConfigured(): boolean {
  return true;
}
