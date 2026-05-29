import Link from "next/link";
import type { EventData } from "../../../lib/events/types";

export function EventFooter({ event }: { event: EventData }) {
  return (
    <footer className="border-t border-gold/15 bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-sm font-semibold tracking-[0.15em] text-foreground uppercase">
              {event.edition}
            </p>
            <p className="mt-2 text-sm text-muted">{event.contacts.organizer}</p>
          </div>
          <div>
            <p className="section-label mb-3">Contactos</p>
            <a
              href={`mailto:${event.contacts.email}`}
              className="text-sm text-gold hover:underline"
            >
              {event.contacts.email}
            </a>
          </div>
          <div>
            <p className="section-label mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href={event.legal?.privacy ?? "#"} className="hover:text-gold">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link href={event.legal?.terms ?? "#"} className="hover:text-gold">
                  Termos e condições
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gold">
                  Voltar a O Carrista
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-gold/10 pt-6 text-center text-[0.65rem] text-muted">
          © {new Date().getFullYear()} O Carrista · {event.location}
        </p>
      </div>
    </footer>
  );
}
