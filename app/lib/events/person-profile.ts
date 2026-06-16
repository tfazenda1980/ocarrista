import type { EventData, EventModerator, EventSpeaker } from "./types";

export type EventPersonProfile = EventSpeaker & {
  profileLabel: string;
};

export function resolvePersonProfile(
  event: EventData,
  id: string,
): EventPersonProfile | null {
  const speaker = event.speakers.find((s) => s.id === id);
  if (speaker) {
    return {
      ...speaker,
      profileLabel: "Orador · Workshop 2026",
    };
  }

  const moderator = event.moderators?.find((m) => m.id === id);
  if (!moderator) return null;

  const fromSpeaker = event.speakers.find((s) => s.id === moderator.id);
  if (fromSpeaker) {
    return {
      ...fromSpeaker,
      role: fromSpeaker.role.includes("Moderador")
        ? fromSpeaker.role
        : `${fromSpeaker.role} · Moderador`,
      profileLabel: "Moderador · Workshop 2026",
    };
  }

  return moderatorToProfile(moderator);
}

function moderatorToProfile(moderator: EventModerator): EventPersonProfile {
  return {
    id: moderator.id,
    name: moderator.name,
    fullName: moderator.fullName,
    role: moderator.role ?? "Moderador",
    bio: moderator.bio ?? `${moderator.name} — moderador do workshop.`,
    bioLong: moderator.bioLong,
    bioSections: moderator.bioSections,
    image: moderator.image,
    axisId: moderator.axisId,
    profileLabel: "Moderador · Workshop 2026",
  };
}
