import Link from "next/link";
import type { CncEventData } from "@/app/lib/events/cnc-types";

export function CncFooter({ event }: { event: CncEventData }) {
  return (
    <footer className="border-t border-gold/15 bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="font-display text-sm font-semibold tracking-[0.15em] text-foreground uppercase">
              {event.edition}
            </p>
            <p className="mt-2 text-sm text-muted">{event.location}</p>
          </div>
          <div>
            <p className="section-label mb-3">O Carrista</p>
            <Link href="/" className="text-sm text-gold hover:underline">
              Voltar ao site
            </Link>
          </div>
        </div>
        <p className="mt-10 border-t border-gold/10 pt-6 text-center text-[0.65rem] text-muted">
          © {new Date().getFullYear()} O Carrista · {event.title}
        </p>
      </div>
    </footer>
  );
}
