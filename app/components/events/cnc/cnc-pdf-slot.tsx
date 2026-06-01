import type { CncPdfResource } from "@/app/lib/events/cnc-types";

type CncPdfSlotProps = {
  resource: CncPdfResource;
};

export function CncPdfSlot({ resource }: CncPdfSlotProps) {
  const available = Boolean(resource.href);

  if (available && resource.href) {
    return (
      <a
        href={resource.href}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="card-tactical flex min-h-[5.5rem] flex-col justify-center border-gold/30 p-4 transition-colors hover:border-gold/50 hover:bg-gold/5"
      >
        <span className="font-display text-xs tracking-[0.12em] text-gold uppercase">
          {resource.label}
        </span>
        <span className="mt-2 text-[0.7rem] text-muted">Descarregar PDF →</span>
      </a>
    );
  }

  return (
    <div
      className="card-tactical flex min-h-[5.5rem] flex-col justify-center border-dashed border-gold/15 p-4 opacity-80"
      aria-label={`${resource.label} — documento ainda não publicado`}
    >
      <span className="font-display text-xs tracking-[0.12em] text-gold/70 uppercase">
        {resource.label}
      </span>
      <span className="mt-2 text-[0.7rem] text-muted">PDF em breve</span>
    </div>
  );
}
