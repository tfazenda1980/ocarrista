import type { EventSpeaker } from "../../../lib/events/types";
import {
  resolveSpeakersFromField,
  speakerProfileHref,
} from "../../../lib/events/speaker-links";

type EventProgramSpeakersProps = {
  speakerField: string;
  speakers: EventSpeaker[];
};

export function EventProgramSpeakers({
  speakerField,
  speakers,
}: EventProgramSpeakersProps) {
  const parts = resolveSpeakersFromField(speakerField, speakers);

  return (
    <p className="event-program-speaker font-display text-sm leading-relaxed tracking-wide text-gold uppercase">
      {parts.map((part, i) => (
        <span key={`${part.label}-${i}`}>
          {i > 0 ? (
            <span className="text-muted/50" aria-hidden>
              {" "}
              ·{" "}
            </span>
          ) : null}
          {part.speaker ? (
            <a
              href={speakerProfileHref(part.speaker)}
              className="transition-colors hover:text-gold-bright hover:underline hover:underline-offset-4"
            >
              {part.label}
            </a>
          ) : (
            <span>{part.label}</span>
          )}
        </span>
      ))}
    </p>
  );
}
