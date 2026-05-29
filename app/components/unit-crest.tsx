"use client";

import Image from "next/image";
import { useState } from "react";
import { BRASAO_ALT, BRASAO_SRC } from "../lib/site-assets";

const sizeMap = {
  sm: { boxW: 36, boxH: 36, imgW: 28, imgH: 28 },
  nav: { boxW: 40, boxH: 40, imgW: 32, imgH: 32 },
  md: { boxW: 88, boxH: 88, imgW: 72, imgH: 72 },
  lg: { boxW: 220, boxH: 280, imgW: 200, imgH: 260 },
  xl: { boxW: 300, boxH: 380, imgW: 280, imgH: 360 },
  hero: { boxW: 400, boxH: 500, imgW: 380, imgH: 480 },
} as const;

type UnitCrestProps = {
  size?: keyof typeof sizeMap;
  className?: string;
  /** Mostra "CC" se a imagem ainda não existir em public/ */
  fallbackMonogram?: string;
  priority?: boolean;
  /** Sem moldura; fundo branco do PNG funde com o fundo escuro */
  variant?: "framed" | "bare";
};

export function UnitCrest({
  size = "md",
  className = "",
  fallbackMonogram = "CC",
  priority = false,
  variant = "framed",
}: UnitCrestProps) {
  const [failed, setFailed] = useState(false);
  const { boxW, boxH, imgW, imgH } = sizeMap[size];

  if (failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center border border-gold/40 bg-gold/5 font-display font-bold text-gold ${className}`}
        style={{ width: boxW, height: boxH }}
        title="Carro de Combate"
      >
        <span className={size === "sm" || size === "nav" ? "text-xs" : "text-sm"}>
          {fallbackMonogram}
        </span>
      </span>
    );
  }

  const isBare = variant === "bare";

  return (
    <span
      className={
        isBare
          ? `crest-bare relative flex shrink-0 items-center justify-center ${className}`
          : `crest-frame relative flex shrink-0 items-center justify-center ${className}`
      }
      style={{ width: boxW, height: boxH }}
    >
      <Image
        src={BRASAO_SRC}
        alt={BRASAO_ALT}
        width={imgW}
        height={imgH}
        priority={priority}
        className={
          isBare
            ? "crest-bare-image relative z-10 h-full w-full object-contain object-center drop-shadow-[0_6px_36px_rgba(198,164,75,0.28)]"
            : "relative z-10 h-full w-full object-contain drop-shadow-[0_4px_24px_rgba(198,164,75,0.25)]"
        }
        onError={() => setFailed(true)}
      />
    </span>
  );
}

type UnitCrestWatermarkProps = {
  className?: string;
};

/** Brasão grande e subtil no fundo do hero */
export function UnitCrestWatermark({ className = "" }: UnitCrestWatermarkProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
      aria-hidden
    >
      <Image
        src={BRASAO_SRC}
        alt=""
        width={520}
        height={520}
        className="crest-watermark max-h-[min(70vh,520px)] w-auto object-contain opacity-[0.07] sm:opacity-[0.09]"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
