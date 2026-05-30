import type { EventSession, EventSessionKind } from "../../../lib/events/types";

export function timeLabel(session: EventSession): string {
  if (session.endTime) return `${session.time} – ${session.endTime}`;
  return session.time;
}

function kindStyles(kind: EventSessionKind | undefined): string {
  switch (kind) {
    case "break":
      return "event-program-item--break";
    case "meal":
      return "event-program-item--meal";
    case "activity":
      return "event-program-item--activity";
    case "section":
      return "event-program-item--section";
    default:
      return "event-program-item--session";
  }
}

type EventProgramItemProps = {
  session: EventSession;
  /** A, B, C… só em sessões do painel */
  sessionLabel?: string;
};

export function EventProgramItem({ session, sessionLabel }: EventProgramItemProps) {
  const kind = session.kind ?? "session";
  const isInterval = kind === "break" || kind === "meal";
  const isSection = kind === "section";
  const isSession = kind === "session";
  const isSpotlight = session.highlight && (kind === "activity" || kind === "session");

  if (isInterval) {
    return (
      <li className={`event-program-item ${kindStyles(kind)}`}>
        <div className="event-program-interval" role="presentation">
          <time className="event-program-interval-time font-mono text-[0.65rem] leading-snug tracking-wider text-muted sm:text-xs">
            {timeLabel(session)}
          </time>
          <div className="event-program-interval-body">
            <span className="event-program-interval-rule" aria-hidden />
            <span className="font-display shrink-0 text-xs tracking-[0.12em] text-gold/80 uppercase">
              {session.title}
            </span>
            <span className="event-program-interval-rule" aria-hidden />
          </div>
        </div>
      </li>
    );
  }

  const cardClass = isSpotlight
    ? "event-program-card event-program-card--spotlight"
    : "event-program-card";

  return (
    <li className={`event-program-item ${kindStyles(kind)}`}>
      <div className={cardClass}>
        <div className="event-program-card-head">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {sessionLabel && isSession && (
              <span className="event-program-session-label" aria-hidden>
                {sessionLabel}
              </span>
            )}
            <time className="font-mono text-xs tracking-wider text-gold sm:text-sm">
              {timeLabel(session)}
            </time>
          </div>
          {session.duration && (
            <span className="event-program-duration font-mono text-[0.65rem] tracking-wider text-gold uppercase">
              {session.duration}
            </span>
          )}
        </div>
        <div className="event-program-card-body">
          <h4
            className={`font-display leading-snug tracking-wide uppercase ${
              isSection || session.highlight
                ? "text-base text-gold sm:text-lg"
                : "text-sm text-foreground sm:text-base"
            }`}
          >
            {session.title}
          </h4>
          {session.speaker && (
            <p className="event-program-speaker font-display text-sm leading-relaxed tracking-wide text-gold uppercase">
              {session.speaker}
            </p>
          )}
          {session.description && (
            <p className="event-program-desc text-sm leading-relaxed text-muted">
              {session.description}
            </p>
          )}
          {session.highlight && kind === "session" && (
            <span className="mt-4 inline-block border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[0.55rem] tracking-wider text-gold uppercase">
              Momento institucional
            </span>
          )}
          {session.highlight && kind === "activity" && (
            <span className="mt-4 inline-block border border-gold/40 bg-gold/15 px-2 py-0.5 font-mono text-[0.55rem] tracking-wider text-gold uppercase">
              Destaque do dia
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
