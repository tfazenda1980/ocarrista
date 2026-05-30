"use client";

import { MotionReveal } from "../../motion-reveal";
import { IconShield, IconTarget } from "../../icons";
import type { EventData, EventPanel, EventTheme } from "../../../lib/events/types";
import { EventProgramItem } from "./event-program-item";

const axisIcons = [<IconShield key="s" />, <IconTarget key="t" />];

function TransversalBlock({ panel }: { panel: EventPanel }) {
  return (
    <div className="event-program-transversal">
      {panel.name ? (
        <h3 className="font-display mb-5 text-center text-sm tracking-[0.14em] text-gold/90 uppercase">
          {panel.name}
        </h3>
      ) : null}
      <ol className="event-program-list event-program-list--transversal mx-auto">
        {panel.sessions.map((session) => (
          <EventProgramItem
            key={`${session.time}-${session.title}`}
            session={session}
          />
        ))}
      </ol>
    </div>
  );
}

function AxisColumn({
  theme,
  panel,
  moderator,
  index,
}: {
  theme: EventTheme;
  panel: EventPanel | undefined;
  moderator?: { name: string };
  index: number;
}) {
  return (
    <div className="event-axis-column">
      <div className="event-axis-header">
        <div className="mb-4 flex h-12 w-12 items-center justify-center border border-gold/35 text-gold">
          {axisIcons[index % axisIcons.length]}
        </div>
        <p className="font-mono mb-2 text-[0.65rem] tracking-[0.2em] text-gold uppercase">
          Eixo {index + 1}
        </p>
        <p className="font-display mb-2 text-sm tracking-[0.1em] text-gold/90 uppercase">
          {theme.subtitle}
        </p>
        <h3 className="font-display text-xl font-semibold tracking-wide text-foreground uppercase sm:text-2xl">
          {theme.title}
        </h3>
      </div>

      {moderator && (
        <div className="event-axis-moderator mt-8">
          <p className="section-label mb-2">Moderador</p>
          <p className="font-display text-base font-semibold tracking-wide text-gold uppercase">
            {moderator.name}
          </p>
        </div>
      )}

      {panel && (
        <div className="mt-8">
          <ol className="event-program-list">
            {panel.sessions.map((session) => {
              const sessionOnly = panel.sessions.filter(
                (s) => (s.kind ?? "session") === "session",
              );
              const sessionIndex = sessionOnly.findIndex(
                (s) => s.time === session.time && s.title === session.title,
              );
              const label =
                (session.kind ?? "session") === "session" && sessionIndex >= 0
                  ? String.fromCharCode(65 + sessionIndex)
                  : undefined;

              return (
                <EventProgramItem
                  key={`${session.time}-${session.title}`}
                  session={session}
                  sessionLabel={label}
                />
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

export function EventAxesSection({ event }: { event: EventData }) {
  const transversal = event.panels.filter((p) => !p.axisId);
  const opening = transversal[0];
  const midday = transversal.find((p) => p.sessions.some((s) => s.kind === "meal"));
  const closing = transversal.find((p) =>
    p.sessions.some((s) => s.title === "Considerações finais"),
  );

  return (
    <section id="eixos" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">02 · Eixos e programa</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Dois eixos, um dia
          </h2>
          <p className="mb-6 max-w-3xl text-muted">
            A manhã centra-se nas lições da guerra atual; a tarde transforma conhecimento em
            mudança operacional — com abertura, intervalos e encerramento.
          </p>
          <div className="gold-line mb-14 w-24" />
        </MotionReveal>

        {opening && (
          <MotionReveal className="mb-14">
            <TransversalBlock panel={opening} />
          </MotionReveal>
        )}

        <div className="event-axes-grid relative grid gap-10 lg:grid-cols-2 lg:gap-0">
          <div
            className="event-axes-divider pointer-events-none absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold/35 to-transparent lg:block"
            aria-hidden
          />

          {event.themes.map((theme, i) => {
            const panel = event.panels.find((p) => p.axisId === theme.id);
            const moderator = event.moderators?.find((m) => m.axisId === theme.id);
            return (
              <MotionReveal key={theme.id} delay={i * 0.1}>
                <AxisColumn
                  theme={theme}
                  panel={panel}
                  moderator={moderator}
                  index={i}
                />
              </MotionReveal>
            );
          })}
        </div>

        {midday && (
          <MotionReveal className="mt-14">
            <TransversalBlock panel={midday} />
          </MotionReveal>
        )}

        {closing && (
          <MotionReveal className="mt-14">
            <TransversalBlock panel={closing} />
          </MotionReveal>
        )}
      </div>
    </section>
  );
}
