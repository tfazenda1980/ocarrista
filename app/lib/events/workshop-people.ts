import fs from "node:fs";
import path from "node:path";
import type { EventData } from "./types";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

/** Pasta: public/eventos/workshop/{year}/oradores/{id}.{jpg|png|...} */
export function workshopPersonImageDir(year: string): string {
  return path.join(
    process.cwd(),
    "public",
    "eventos",
    "workshop",
    year,
    "oradores",
  );
}

export function workshopPersonImageUrl(
  year: string,
  personId: string,
): string | undefined {
  const dir = workshopPersonImageDir(year);
  if (!fs.existsSync(dir)) return undefined;

  for (const ext of IMAGE_EXTENSIONS) {
    const file = path.join(dir, `${personId}.${ext}`);
    if (fs.existsSync(file)) {
      return `/eventos/workshop/${year}/oradores/${personId}.${ext}`;
    }
  }

  return undefined;
}

/** Preenche `image` a partir da pasta de oradores quando o JSON ainda não tem foto. */
export function enrichWorkshopEvent(event: EventData): EventData {
  const year = event.year;

  return {
    ...event,
    speakers: event.speakers.map((speaker) => ({
      ...speaker,
      image: speaker.image ?? workshopPersonImageUrl(year, speaker.id),
    })),
    moderators: event.moderators?.map((moderator) => ({
      ...moderator,
      image: moderator.image ?? workshopPersonImageUrl(year, moderator.id),
    })),
  };
}
