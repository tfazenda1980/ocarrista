"use client";

import { MotionReveal } from "../../motion-reveal";
import type { EventData } from "../../../lib/events/types";

export function EventRegistration({ event }: { event: EventData }) {
  return (
    <section id="inscricao" className="event-section scroll-mt-24 bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <p className="section-label mb-3">06 · Inscrição</p>
          <h2 className="display-heading mb-6 text-3xl font-semibold sm:text-4xl">
            Reserve o seu lugar
          </h2>
          <div className="gold-line mb-10 w-24" />
        </MotionReveal>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <MotionReveal delay={0.06}>
            <p className="leading-relaxed text-muted">
              Inscrição sujeita a confirmação. Após validação, receberá acesso à
              área do participante e, quando aplicável, zonas reservadas a
              convidados.
            </p>
            {event.registration.note && (
              <p className="mt-4 border-l-2 border-gold/40 pl-4 text-sm text-muted">
                {event.registration.note}
              </p>
            )}
          </MotionReveal>

          <MotionReveal delay={0.12}>
            <form
              className="card-tactical space-y-4 p-8 sm:p-10"
              action="#"
              method="post"
            >
              <input
                type="text"
                name="nome"
                placeholder="Nome completo"
                required
                className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-gold/50 focus:outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-gold/50 focus:outline-none"
              />
              <input
                type="text"
                name="entidade"
                placeholder="Entidade / Unidade (opcional)"
                className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-gold/50 focus:outline-none"
              />
              <textarea
                name="mensagem"
                rows={3}
                placeholder="Necessidades ou Questões"
                className="w-full resize-none border border-gold/20 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-gold/50 focus:outline-none"
              />
              <button type="submit" className="btn-primary w-full">
                {event.registration.cta}
              </button>
            </form>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
