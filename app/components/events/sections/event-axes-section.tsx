"use client";

import { MotionReveal } from "../../motion-reveal";
import { IconShield, IconTarget } from "../../icons";
import type { EventData, EventPanel, EventTheme } from "../../../lib/events/types";
import { EventProgramItem } from "./event-program-item";
import { EventSpotlight } from "./event-spotlight";

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

function AxisTrack({
  theme,
  panel,
  moderator,
  index,
  speakers,
  eventYear,
}: {
  theme: EventTheme;
  panel: EventPanel | undefined;
  moderator?: { name: string };
  index: number;
  speakers: EventData["speakers"];
  eventYear: string;
}) {
  return (
    <div className="event-axis-track">
      <div className="event-axis-header">
        <div className="mb-4 flex h-12 w-12 items-center justify-center border border-gold/35 text-gold">
          {axisIcons[index % axisIcons.length]}
        </div>
        <p className="font-mono mb-2 text-[0.65rem] tracking-[0.2em] text-gold uppercase">
          Eixo {index + 1} · {index === 0 ? "Manhã" : "Tarde"}
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
          <ol className="event-program-list mx-auto lg:mx-0">
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
                  speakers={speakers}
                  eventYear={eventYear}
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
  const closing = transversal.find((p) =>
    p.sessions.some((s) => s.title === "Considerações finais"),
  );

  const themes = event.themes;
  const morningTheme = themes[0];
  const afternoonTheme = themes[1];
  const morningPanel = event.panels.find((p) => p.axisId === morningTheme?.id);
  const afternoonPanel = event.panels.find((p) => p.axisId === afternoonTheme?.id);
  const morningModerator = event.moderators?.find(
    (m) => m.axisId === morningTheme?.id,
  );
  const afternoonModerator = event.moderators?.find(
    (m) => m.axisId === afternoonTheme?.id,
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
            Programa em ordem cronológica: Painel 1 de manhã, destaque Challenger ao
            meio-dia, Painel 2 à tarde — mais abertura e encerramento.
          </p>
          <div className="gold-line mb-14 w-24" />
        </MotionReveal>

        {opening && (
          <MotionReveal className="mb-14">
            <TransversalBlock panel={opening} />
          </MotionReveal>
        )}

        {morningTheme && (
          <MotionReveal className="mb-14">
            <AxisTrack
              theme={morningTheme}
              panel={morningPanel}
              moderator={morningModerator}
              index={0}
              speakers={event.speakers}
              eventYear={event.year}
            />
          </MotionReveal>
        )}

        {event.spotlight && (
          <>
            <p className="event-program-midday-note mx-auto mb-8 max-w-lg px-4 text-center text-sm leading-relaxed text-muted sm:mb-10">
              Entre o Painel 1 (manhã) e o Painel 2 (tarde). O destaque{" "}
              <a href="#destaque" className="text-gold hover:underline">
                Challenger — Pista Final
              </a>{" "}
              decorre das 12:00 às 12:30, antes do almoço.
            </p>
            <MotionReveal className="mb-14">
              <EventSpotlight event={event} embedded />
            </MotionReveal>
          </>
        )}

        {afternoonTheme && (
          <MotionReveal className="mb-14">
            <AxisTrack
              theme={afternoonTheme}
              panel={afternoonPanel}
              moderator={afternoonModerator}
              index={1}
              speakers={event.speakers}
              eventYear={event.year}
            />
          </MotionReveal>
        )}

        {closing && (
          <MotionReveal>
            <TransversalBlock panel={closing} />
          </MotionReveal>
        )}
      </div>
    </section>
  );
}
