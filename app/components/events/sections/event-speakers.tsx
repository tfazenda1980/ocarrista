"use client";

import { MotionReveal } from "../../motion-reveal";
import type { EventData, EventModerator, EventSpeaker } from "../../../lib/events/types";
import { speakerHashId } from "../../../lib/events/speaker-links";
import { resolvePersonProfile } from "../../../lib/events/person-profile";
import { EventPersonPhoto } from "./event-person-photo";

function moderatorHashId(mod: EventModerator): string {
  return `moderador-${mod.id}`;
}

export function EventSpeakers({
  event,
  hideModerators = false,
}: {
  event: EventData;
  hideModerators?: boolean;
}) {
  function openSpeaker(speaker: EventSpeaker) {
    window.location.hash = speakerHashId(speaker);
  }

  function openModerator(mod: EventModerator) {
    window.location.hash = moderatorHashId(mod);
  }

  return (
    <section id="oradores" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">04 · Oradores</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            As vozes do Workshop
          </h2>
          <div className="gold-line mb-12 w-24" />
        </MotionReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {event.speakers.map((speaker, i) => (
            <MotionReveal key={speaker.id} delay={i * 0.07}>
              <button
                id={speakerHashId(speaker)}
                type="button"
                onClick={() => openSpeaker(speaker)}
                className="event-speaker-card group w-full scroll-mt-28 overflow-hidden text-left"
              >
                <div className="relative mb-4 flex aspect-[4/5] max-h-52 items-center justify-center overflow-hidden border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent transition-colors group-hover:border-gold/45">
                  <EventPersonPhoto image={speaker.image} name={speaker.name} />
                </div>
                <h3 className="font-display text-base font-semibold tracking-wide text-foreground uppercase">
                  {speaker.name}
                </h3>
                <p className="mt-1 text-sm text-gold">{speaker.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
                  {speaker.bio}
                </p>
                <span className="mt-4 inline-block font-display text-[0.6rem] tracking-[0.18em] text-gold uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  Ver perfil →
                </span>
              </button>
            </MotionReveal>
          ))}
        </div>

        {!hideModerators && event.moderators && event.moderators.length > 0 && (
          <MotionReveal className="mt-16">
            <p className="section-label mb-3">Moderadores</p>
            <h3 className="font-display mb-6 text-xl font-semibold tracking-wide text-foreground uppercase sm:text-2xl">
              Condução dos painéis
            </h3>
            <ul className="grid gap-6 sm:grid-cols-2">
              {event.moderators.map((mod) => {
                const profile = resolvePersonProfile(event, mod.id);
                const image = profile?.image;
                const bio = profile?.bio;

                return (
                  <li key={mod.id}>
                    <button
                      id={moderatorHashId(mod)}
                      type="button"
                      onClick={() => openModerator(mod)}
                      className="event-speaker-card group w-full overflow-hidden text-left"
                    >
                      <div className="relative mb-4 flex aspect-[4/5] max-h-44 items-center justify-center overflow-hidden border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent transition-colors group-hover:border-gold/45">
                        <EventPersonPhoto image={image} name={mod.name} />
                      </div>
                      <p className="font-display text-base font-semibold tracking-wide text-foreground uppercase">
                        {mod.name}
                      </p>
                      <p className="mt-1 text-sm text-gold">Moderador</p>
                      {bio && (
                        <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-2">
                          {bio}
                        </p>
                      )}
                      <span className="mt-4 inline-block font-display text-[0.6rem] tracking-[0.18em] text-gold uppercase opacity-0 transition-opacity group-hover:opacity-100">
                        Ver perfil →
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </MotionReveal>
        )}
      </div>
    </section>
  );
}
