"use client";

import Image from "next/image";
import { useState } from "react";
import { BRASAO_ALT, BRASAO_SRC } from "../lib/site-assets";

const sizeMap = {
  sm: { box: 36, img: 28 },
  nav: { box: 40, img: 32 },
  md: { box: 88, img: 72 },
  lg: { box: 200, img: 168 },
  xl: { box: 320, img: 272 },
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
  const { box, img } = sizeMap[size];

  if (failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center border border-gold/40 bg-gold/5 font-display font-bold text-gold ${className}`}
        style={{ width: box, height: box }}
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
      style={{ width: box, height: box }}
    >
      <Image
        src={BRASAO_SRC}
        alt={BRASAO_ALT}
        width={img}
        height={img}
        priority={priority}
        className={
          isBare
            ? "crest-bare-image relative z-10 object-contain drop-shadow-[0_4px_28px_rgba(198,164,75,0.2)]"
            : "relative z-10 object-contain drop-shadow-[0_4px_24px_rgba(198,164,75,0.25)]"
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
