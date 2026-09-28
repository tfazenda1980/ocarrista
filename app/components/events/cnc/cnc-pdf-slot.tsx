"use client";

import type { CncPdfResource } from "@/app/lib/events/cnc-types";
import { getSketchKind } from "@/app/lib/challenger/sketch";
import { useT } from "../../i18n/locale-provider";

type CncPdfSlotProps = {
  resource: CncPdfResource;
  selected?: boolean;
  onOpen?: () => void;
};

function actionLabel(
  resource: CncPdfResource,
  inline: boolean,
  t: (path: string) => string,
): string {
  if (inline) return t("pdf.open");
  const kind = getSketchKind(resource.mime ?? null, resource.href);
  if (kind === "image") return t("pdf.viewDrawing");
  if (kind === "pdf") return t("pdf.downloadPdf");
  if (resource.mime?.includes("presentation") || resource.mime?.includes("powerpoint")) {
    return t("pdf.downloadPpt");
  }
  return t("pdf.downloadDoc");
}

const slotClass =
  "card-tactical flex min-h-[5.5rem] w-full flex-col justify-center border-gold/30 p-4 text-left transition-colors hover:border-gold/50 hover:bg-gold/5";

export function CncPdfSlot({ resource, selected = false, onOpen }: CncPdfSlotProps) {
  const { t } = useT();
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
        <span className="mt-2 text-[0.7rem] text-muted">{actionLabel(resource, true, t)}</span>
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
        <span className="mt-2 text-[0.7rem] text-muted">{actionLabel(resource, false, t)}</span>
      </a>
    );
  }

  return (
    <div
      className="card-tactical flex min-h-[5.5rem] flex-col justify-center border-dashed border-gold/15 p-4 opacity-80"
      aria-label={t("pdf.unpublished", { label: resource.label })}
    >
      <span className="font-display text-xs tracking-[0.12em] text-gold/70 uppercase">
        {resource.label}
      </span>
      <span className="mt-2 text-[0.7rem] text-muted">{t("pdf.soon")}</span>
    </div>
  );
}
