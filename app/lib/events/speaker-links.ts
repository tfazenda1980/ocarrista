import type { EventSpeaker } from "./types";

export function speakerHashId(speaker: EventSpeaker): string {
  return `orador-${speaker.id}`;
}

export function speakerProfileHref(speaker: EventSpeaker): string {
  return `#${speakerHashId(speaker)}`;
}

/** Separa vários oradores no mesmo campo (ex.: «Cap X · Ten Y»). */
export function parseSpeakerField(field: string): string[] {
  return field
    .split(/\s*·\s*|\s*,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function resolveSpeakerByName(
  name: string,
  speakers: EventSpeaker[],
): EventSpeaker | undefined {
  const n = name.trim().replace(/\s+/g, " ");
  return speakers.find((s) => {
    const full = s.name.trim().replace(/\s+/g, " ");
    return full === n || full.endsWith(n) || n.endsWith(full);
  });
}

export function resolveSpeakersFromField(
  field: string,
  speakers: EventSpeaker[],
): { label: string; speaker?: EventSpeaker }[] {
  return parseSpeakerField(field).map((label) => ({
    label,
    speaker: resolveSpeakerByName(label, speakers),
  }));
}
