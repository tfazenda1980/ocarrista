"use client";

import { MotionReveal } from "../../motion-reveal";
import type { CncEventData } from "@/app/lib/events/cnc-types";
import { CncPdfGroup } from "./cnc-pdf-group";
import { CncPdfSlot } from "./cnc-pdf-slot";
import { CncDocumentPreview } from "./cnc-document-preview";
import { CncPrizesGallery } from "./cnc-prizes-gallery";

export function CncDisciplines({ event }: { event: CncEventData }) {
  return (
    <section id="provas" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">05 · Provas</p>
          <h2 className="display-heading mb-4 text-3xl font-semibold sm:text-4xl">
            Provas e documentação
          </h2>
          <p className="mb-10 max-w-2xl text-muted">
            Em cada categoria encontram subsetores com ordens de entrada, croquis e resultados.
            A galeria de prémios é um documento em largura total com fotografias por prova.
          </p>
          <div className="gold-line mb-12 w-24" />
        </MotionReveal>

        <nav
          className="mb-12 flex flex-wrap gap-3 border-b border-gold/15 pb-6"
          aria-label="Subsecções de provas"
        >
          {event.disciplines.map((d) => (
            <a
              key={d.id}
              href={`#prova-${d.id}`}
              className="font-display text-xs tracking-[0.12em] text-gold/80 uppercase hover:text-gold"
            >
              {d.title}
            </a>
          ))}
        </nav>

        <div className="space-y-16 sm:space-y-20">
          {event.disciplines.map((discipline, index) => (
            <div
              key={discipline.id}
              id={`prova-${discipline.id}`}
              className="scroll-mt-28"
            >
              <MotionReveal delay={index * 0.04}>
                <h3 className="font-display mb-2 text-xl font-semibold tracking-wide text-foreground uppercase sm:text-2xl">
                  {discipline.title}
                </h3>
                {discipline.description && (
                  <p className="mb-6 max-w-2xl text-sm text-muted sm:text-base">
                    {discipline.description}
                  </p>
                )}
                {discipline.galleryPdf ? (
                  <CncPrizesGallery galleryPdf={discipline.galleryPdf} />
                ) : discipline.sections?.length ? (
                  <div className="space-y-10">
                    {discipline.sections.map((section) => (
                      <div key={section.id} id={`prova-${section.id}`} className="scroll-mt-28">
                        <h4 className="font-display mb-4 text-sm font-semibold tracking-[0.14em] text-gold uppercase">
                          {section.title}
                        </h4>
                        {section.resources ? (
                          <CncPdfGroup resources={section.resources} />
                        ) : section.resultados ? (
                          <div className="space-y-6">
                            <div className="max-w-sm">
                              <CncPdfSlot resource={section.resultados} />
                            </div>
                            {section.resultados.href ? (
                              <CncDocumentPreview
                                resource={section.resultados}
                                hint="Resultados finais — deslize para folhear o documento"
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : discipline.resources ? (
                  <CncPdfGroup resources={discipline.resources} />
                ) : null}
              </MotionReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
