import type { QaRoomId } from "./types";

export function checkAudiencePassword(room: QaRoomId, password: string): boolean {
  const expected =
    room === "debate-painel-1"
      ? process.env.WORKSHOP_QA_P1_PASSWORD
      : process.env.WORKSHOP_QA_P2_PASSWORD;
  if (!expected || !password) return false;
  return password.trim() === expected;
}

export function checkModPassword(password: string): boolean {
  const expected = process.env.WORKSHOP_QA_MOD_PASSWORD;
  if (!expected || !password) return false;
  return password.trim() === expected;
}

export function qaConfigured(): boolean {
  return !!(
    process.env.WORKSHOP_QA_MOD_PASSWORD &&
    process.env.WORKSHOP_QA_P1_PASSWORD &&
    process.env.WORKSHOP_QA_P2_PASSWORD
  );
}
