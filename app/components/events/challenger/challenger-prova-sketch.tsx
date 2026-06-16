"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import type { ChallengerProva } from "@/app/lib/challenger/types";
import { getSketchKind } from "@/app/lib/challenger/sketch";
import { PdfHorizontalViewer } from "../../pdf-horizontal-viewer";

export function ChallengerProvaSketch({ prova }: { prova: ChallengerProva }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.06, once: true });

  if (!prova.sketch_url) return null;

  const kind = getSketchKind(prova.sketch_mime, prova.sketch_url);

  if (kind === "pdf") {
    return (
      <div
        ref={ref}
        className="challenger-sketch-viewer mt-8 w-full"
      >
        <PdfHorizontalViewer
          pdfUrl={prova.sketch_url}
          active={inView}
          label={prova.title}
          hint="Deslize ou use as setas para folhear o croqui"
          showDownloadFooter={false}
        />
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div
        ref={ref}
        className="challenger-sketch-viewer challenger-sketch-viewer--image mt-8"
      >
        <div className="challenger-sketch-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={prova.sketch_url}
            alt={prova.title}
            className="challenger-sketch-image"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  const isPpt = /\.pptx?$/i.test(prova.sketch_url.split("?")[0]);
  if (isPpt) {
    return (
      <div
        ref={ref}
        className="challenger-sketch-viewer challenger-sketch-viewer--embed mt-8"
      >
        <iframe
          title={prova.title}
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(prova.sketch_url)}`}
          className="challenger-sketch-embed"
          allowFullScreen
        />
      </div>
    );
  }

  return null;
}
