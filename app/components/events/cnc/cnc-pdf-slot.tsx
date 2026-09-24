import type { CncPdfResource } from "@/app/lib/events/cnc-types";
import { getSketchKind } from "@/app/lib/challenger/sketch";

type CncPdfSlotProps = {
  resource: CncPdfResource;
  selected?: boolean;
  onOpen?: () => void;
};

function actionLabel(resource: CncPdfResource, inline: boolean): string {
  if (inline) return "Abrir documento →";
  const kind = getSketchKind(resource.mime ?? null, resource.href);
  if (kind === "image") return "Ver desenho →";
  if (kind === "pdf") return "Descarregar PDF →";
  if (resource.mime?.includes("presentation") || resource.mime?.includes("powerpoint")) {
    return "Descarregar PPT →";
  }
  return "Descarregar documento →";
}

const slotClass =
  "card-tactical flex min-h-[5.5rem] w-full flex-col justify-center border-gold/30 p-4 text-left transition-colors hover:border-gold/50 hover:bg-gold/5";

export function CncPdfSlot({ resource, selected = false, onOpen }: CncPdfSlotProps) {
  const available = Boolean(resource.href);
  const selectedClass = selected ? "border-gold bg-gold/10" : "";

  if (available && resource.href && onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={selected}
        className={`${slotClass} ${selectedClass}`}
      >
        <span className="font-display text-xs tracking-[0.12em] text-gold uppercase">
          {resource.label}
        </span>
        <span className="mt-2 text-[0.7rem] text-muted">{actionLabel(resource, true)}</span>
      </button>
    );
  }

  if (available && resource.href) {
    return (
      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className={slotClass}
      >
        <span className="font-display text-xs tracking-[0.12em] text-gold uppercase">
          {resource.label}
        </span>
        <span className="mt-2 text-[0.7rem] text-muted">{actionLabel(resource, false)}</span>
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
      <span className="mt-2 text-[0.7rem] text-muted">Documento em breve</span>
    </div>
  );
}
