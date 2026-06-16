"use client";

import type { EventData, EventModerator } from "../../../lib/events/types";
import { resolvePersonProfile } from "../../../lib/events/person-profile";
import { EventPersonPhoto } from "./event-person-photo";

function moderatorHashId(mod: EventModerator): string {
  return `moderador-${mod.id}`;
}

export function EventAxisModerator({
  event,
  moderator,
}: {
  event: EventData;
  moderator: EventModerator;
}) {
  const profile = resolvePersonProfile(event, moderator.id);
  const image = profile?.image;
  const bio = profile?.bio;

  return (
    <div className="event-axis-moderator mt-8">
      <p className="section-label mb-3">Moderador</p>
      <a
        href={`#${moderatorHashId(moderator)}`}
        className="event-speaker-card group flex max-w-sm items-center gap-4 overflow-hidden p-3 transition-colors hover:border-gold/45"
      >
        <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent">
          <EventPersonPhoto
            image={image}
            name={moderator.name}
            className="h-full w-full object-cover object-[center_12%]"
          />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tracking-wide text-foreground uppercase">
            {moderator.name}
          </p>
          {bio ? (
            <p className="mt-1 text-xs leading-relaxed text-muted line-clamp-2">
              {bio}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gold">Moderador</p>
          )}
          <span className="mt-2 inline-block font-display text-[0.55rem] tracking-[0.16em] text-gold uppercase opacity-70 transition-opacity group-hover:opacity-100">
            Ver perfil →
          </span>
        </div>
      </a>
    </div>
  );
}
