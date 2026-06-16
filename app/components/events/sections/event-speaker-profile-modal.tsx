"use client";

import { motion } from "framer-motion";
import type { EventPersonProfile } from "../../../lib/events/person-profile";
import { EventPersonPhoto } from "./event-person-photo";

function SpeakerInitials({ name }: { name: string }) {
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  return (
    <span className="font-display text-3xl font-bold text-gold uppercase">
      {initials}
    </span>
  );
}

export function EventSpeakerProfileModal({
  speaker,
  onClose,
}: {
  speaker: EventPersonProfile;
  onClose: () => void;
}) {
  const hasSections = Boolean(speaker.bioSections?.length);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/92 backdrop-blur-md" />
      <motion.div
        role="dialog"
        aria-modal
        aria-labelledby="speaker-modal-title"
        className="event-speaker-profile-modal card-tactical relative z-10 max-h-[90vh] w-full max-w-3xl overflow-hidden"
        initial={{ scale: 0.96, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 font-mono text-xs tracking-wider text-muted transition-colors hover:text-gold"
        >
          FECHAR
        </button>

        <div className="grid max-h-[90vh] overflow-y-auto sm:grid-cols-[minmax(12rem,38%)_1fr]">
          <div className="relative min-h-[14rem] bg-surface-elevated sm:min-h-full">
            {speaker.image ? (
              <>
                <EventPersonPhoto
                  image={speaker.image}
                  name={speaker.name}
                  className="event-speaker-profile-photo h-full w-full object-cover object-[center_12%]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-background/10 sm:to-background/70"
                  aria-hidden
                />
              </>
            ) : (
              <div className="flex h-full min-h-[14rem] items-center justify-center border-b border-gold/15 bg-gradient-to-b from-gold/10 to-transparent sm:border-b-0 sm:border-r">
                <SpeakerInitials name={speaker.name} />
              </div>
            )}
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <p className="section-label mb-3">{speaker.profileLabel}</p>
            <h3
              id="speaker-modal-title"
              className="display-heading text-2xl font-semibold tracking-wide text-foreground uppercase sm:text-3xl"
            >
              {speaker.name}
            </h3>
            {speaker.fullName && (
              <p className="mt-2 font-display text-sm tracking-[0.12em] text-muted uppercase">
                {speaker.fullName}
              </p>
            )}
            <p className="mt-3 text-sm font-medium text-gold sm:text-base">
              {speaker.role}
            </p>
            <div className="gold-line my-6 w-20" />

            {hasSections ? (
              <div className="space-y-7">
                {speaker.bioSections!.map((section) => (
                  <section key={section.title}>
                    <h4 className="font-display mb-3 text-[0.7rem] tracking-[0.2em] text-gold uppercase">
                      {section.title}
                    </h4>
                    {section.body && (
                      <p className="text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                        {section.body}
                      </p>
                    )}
                    {section.items && section.items.length > 0 && (
                      <ul className="mt-2 space-y-2 border-l border-gold/20 pl-4">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="text-sm leading-relaxed text-muted sm:text-[0.95rem]"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                {speaker.bioLong ?? speaker.bio}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
