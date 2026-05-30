import type { QaRoomId } from "./types";

export const QA_ROOMS: { id: QaRoomId; label: string }[] = [
  { id: "debate-painel-1", label: "Debate — Painel 1" },
  { id: "debate-painel-2", label: "Debate — Painel 2" },
];

export function isQaRoomId(value: string): value is QaRoomId {
  return QA_ROOMS.some((r) => r.id === value);
}

export function qaRoomLabel(room: QaRoomId): string {
  return QA_ROOMS.find((r) => r.id === room)?.label ?? room;
}
