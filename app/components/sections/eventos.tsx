"use client";

import { SectionShell } from "../section-shell";
import { EventCard } from "../events/event-card";
import { IconCalendar, IconTarget, IconShield } from "../icons";
import { CNC_SRC, CHALLENGER_SRC, WORKSHOP_26_SRC, IMGC_SRC } from "../../lib/site-assets";
import { useT } from "../i18n/locale-provider";

const eventMeta = [
  { icon: <IconShield />, href: undefined, backgroundImage: undefined },
  { icon: <IconTarget />, href: "/eventos/cnc", backgroundImage: CNC_SRC },
  { icon: <IconCalendar />, href: "/eventos/workshop", backgroundImage: WORKSHOP_26_SRC },
  { icon: <IconShield />, href: undefined, backgroundImage: undefined },
  { icon: <IconCalendar />, href: undefined, backgroundImage: undefined },
  { icon: <IconCalendar />, href: undefined, backgroundImage: undefined },
  { icon: <IconTarget />, href: "/eventos/challenger", backgroundImage: CHALLENGER_SRC },
  { icon: <IconTarget />, href: "/eventos/imgc", backgroundImage: IMGC_SRC },
];

export function EventosSection() {
  const { t, messages } = useT();

  return (
    <SectionShell
      id="eventos"
      label={t("home.eventsLabel")}
      title={t("home.eventsTitle")}
      description={t("home.eventsDescription")}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {messages.home.events.map((event, index) => (
          <EventCard
            key={event.title}
            title={event.title}
            meta={event.meta}
            description={event.description}
            icon={eventMeta[index]?.icon}
            href={eventMeta[index]?.href}
            backgroundImage={eventMeta[index]?.backgroundImage}
          />
        ))}
      </div>
    </SectionShell>
  );
}
