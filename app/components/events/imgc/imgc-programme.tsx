"use client";

import { MotionReveal } from "../../motion-reveal";
import type { ImgcEventData } from "@/app/lib/events/imgc-types";
import { CncPdfSlot } from "../cnc/cnc-pdf-slot";
import { CncDocumentPreview } from "../cnc/cnc-document-preview";
import { useT } from "../../i18n/locale-provider";

export function ImgcProgramme({ event }: { event: ImgcEventData }) {
  const { t } = useT();
  return (
    <section id="programa" className="event-section scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">{t("imgc.programmeLabel")}</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            {event.programme.title}
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <p className="mb-8 max-w-3xl leading-relaxed text-muted">{event.programme.body}</p>
          <div className="max-w-md">
            <CncPdfSlot resource={event.programme.pdf} />
          </div>
          {event.programme.pdf.href ? (
            <div className="mt-8">
              <CncDocumentPreview resource={event.programme.pdf} hint={t("imgc.programmeHint")} />
            </div>
          ) : null}
        </MotionReveal>
      </div>
    </section>
  );
}
