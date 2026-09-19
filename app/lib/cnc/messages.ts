export const CNC_MESSAGE_KINDS = [
  { id: "contact", label: "Esclarecimento / contacto" },
  { id: "prova", label: "Questão sobre uma prova" },
  { id: "suggestion", label: "Sugestão ou melhoria" },
] as const;

export type CncMessageKind = (typeof CNC_MESSAGE_KINDS)[number]["id"];

export type CncMessage = {
  id: string;
  year: string;
  kind: CncMessageKind;
  provaId: string | null;
  name: string;
  email: string;
  body: string;
  createdAt: string;
};

export function isCncMessageKind(value: string): value is CncMessageKind {
  return CNC_MESSAGE_KINDS.some((kind) => kind.id === value);
}

export function cncMessageKindLabel(kind: CncMessageKind): string {
  return CNC_MESSAGE_KINDS.find((item) => item.id === kind)?.label ?? kind;
}
