"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type PdfHorizontalViewerProps = {
  pdfUrl: string;
  active: boolean;
  /** Cabeçalho sobre o visor (ex. «Galeria de Prémios»). */
  label?: string;
  hint?: string;
  showDownloadFooter?: boolean;
};

type PdfDoc = import("pdfjs-dist").PDFDocumentProxy;

function PdfPageSlide({
  doc,
  pageNum,
  slideWidth,
}: {
  doc: PdfDoc;
  pageNum: number;
  slideWidth: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visible = useInView(ref, { margin: "120px", once: true });
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!visible || rendered || !doc || slideWidth < 100) return;

    let cancelled = false;

    async function draw() {
      const page = await doc.getPage(pageNum);
      const base = page.getViewport({ scale: 1 });
      const scale = (slideWidth * 0.92) / base.width;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      }).promise;

      if (!cancelled) setRendered(true);
    }

    draw().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [visible, rendered, doc, pageNum, slideWidth]);

  return (
    <div
      ref={ref}
      className="pdf-slide flex shrink-0 snap-center snap-always items-center justify-center"
      style={{ width: slideWidth }}
      aria-label={`Página ${pageNum}`}
    >
      {!rendered && (
        <div className="flex h-[min(70vh,640px)] w-[min(92vw,900px)] items-center justify-center border border-gold/15 bg-surface/80">
          <span className="font-mono text-xs text-muted">Página {pageNum}</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`max-h-[min(70vh,640px)] w-auto max-w-[92vw] shadow-lg ${rendered ? "block" : "hidden"}`}
      />
    </div>
  );
}

export function PdfHorizontalViewer({
  pdfUrl,
  active,
  label = "História do RC4",
  hint = "Deslize para o lado para ver cada página",
  showDownloadFooter = true,
}: PdfHorizontalViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideWidth, setSlideWidth] = useState(0);

  const baseUrl = pdfUrl.split("?")[0].split("#")[0];

  useEffect(() => {
    const update = () => setSlideWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjs.getDocument(pdfUrl).promise;
        if (cancelled) return;
        setDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar o PDF.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [active, pdfUrl]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slideWidth < 1) return;
    const page = Math.min(
      totalPages,
      Math.max(1, Math.round(el.scrollLeft / slideWidth) + 1),
    );
    setCurrentPage(page);
  }, [slideWidth, totalPages]);

  if (!active) return null;

  return (
    <div className="pdf-horizontal-wrap">
      <div className="border-y border-gold/15 bg-surface/40 px-4 py-3 text-center sm:px-6">
        <p className="font-display text-xs tracking-[0.2em] text-gold uppercase">
          {label}
        </p>
        <p className="mt-1 text-xs text-muted">
          {hint} · {totalPages > 0 ? `${currentPage} / ${totalPages}` : "—"}
        </p>
      </div>

      {loading && (
        <p className="py-16 text-center text-sm text-muted">A carregar documento…</p>
      )}

      {error && (
        <p className="px-4 py-16 text-center text-sm text-muted">{error}</p>
      )}

      {!loading && !error && doc && slideWidth > 0 && (
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="pdf-horizontal-scroll flex overflow-x-auto overscroll-x-contain"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <PdfPageSlide
              key={i + 1}
              doc={doc}
              pageNum={i + 1}
              slideWidth={slideWidth}
            />
          ))}
        </div>
      )}

      {showDownloadFooter && (
        <div className="flex justify-center gap-4 border-t border-gold/10 px-4 py-3">
          <a href={baseUrl} download className="btn-outline px-4 py-2 text-[0.65rem]">
            Descarregar PDF
          </a>
        </div>
      )}
    </div>
  );
}
