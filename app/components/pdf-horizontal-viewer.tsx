"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const SPREAD_BREAKPOINT_PX = 1024;

type PdfHorizontalViewerProps = {
  pdfUrl: string;
  active: boolean;
  /** Cabeçalho sobre o visor (ex. «Galeria de Prémios»). */
  label?: string;
  hint?: string;
  showDownloadFooter?: boolean;
};

type PdfDoc = import("pdfjs-dist").PDFDocumentProxy;

function spreadCount(totalPages: number, isSpread: boolean) {
  if (totalPages < 1) return 0;
  return isSpread ? Math.ceil(totalPages / 2) : totalPages;
}

function pageRangeLabel(
  focusPage: number,
  totalPages: number,
  isSpread: boolean,
): string {
  if (totalPages < 1) return "—";
  if (!isSpread) return `${focusPage} / ${totalPages}`;
  const left = Math.floor((focusPage - 1) / 2) * 2 + 1;
  const right = Math.min(left + 1, totalPages);
  if (left === right) return `${left} / ${totalPages}`;
  return `${left}–${right} / ${totalPages}`;
}

function spreadIndexForPage(focusPage: number, isSpread: boolean) {
  return isSpread ? Math.floor((focusPage - 1) / 2) : focusPage - 1;
}

function PdfPageCanvas({
  doc,
  pageNum,
  pageWidth,
}: {
  doc: PdfDoc;
  pageNum: number;
  pageWidth: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visible = useInView(ref, { margin: "120px", once: true });
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!visible || rendered || !doc || pageWidth < 80) return;

    let cancelled = false;

    async function draw() {
      const page = await doc.getPage(pageNum);
      const base = page.getViewport({ scale: 1 });
      const scale = (pageWidth * 0.98) / base.width;
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
  }, [visible, rendered, doc, pageNum, pageWidth]);

  return (
    <div
      ref={ref}
      className="flex shrink-0 items-center justify-center"
      style={{ width: pageWidth }}
      aria-label={`Página ${pageNum}`}
    >
      {!rendered && (
        <div
          className="flex h-[min(70vh,640px)] w-full items-center justify-center border border-gold/15 bg-surface/80"
        >
          <span className="font-mono text-xs text-muted">Página {pageNum}</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`max-h-[min(70vh,640px)] w-auto max-w-full shadow-lg ${rendered ? "block" : "hidden"}`}
      />
    </div>
  );
}

function PdfSpreadSlide({
  doc,
  slideWidth,
  leftPage,
  rightPage,
  isSpread,
}: {
  doc: PdfDoc;
  slideWidth: number;
  leftPage: number;
  rightPage: number | null;
  isSpread: boolean;
}) {
  const gap = isSpread ? 24 : 0;
  const pageWidth = isSpread
    ? Math.max(120, (slideWidth - gap - 32) / 2)
    : Math.max(120, slideWidth * 0.92);

  return (
    <div
      className="pdf-slide flex shrink-0 snap-center snap-always items-center justify-center"
      style={{ width: slideWidth }}
    >
      <div
        className={`flex w-full items-center justify-center px-2 sm:px-4 ${
          isSpread ? "gap-4 sm:gap-6" : ""
        }`}
      >
        <PdfPageCanvas doc={doc} pageNum={leftPage} pageWidth={pageWidth} />
        {isSpread && rightPage !== null && (
          <PdfPageCanvas doc={doc} pageNum={rightPage} pageWidth={pageWidth} />
        )}
        {isSpread && rightPage === null && (
          <div
            className="hidden min-h-[min(50vh,480px)] flex-1 border border-dashed border-gold/10 bg-surface/30 lg:block"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

function NavChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export function PdfHorizontalViewer({
  pdfUrl,
  active,
  label = "História do RC4",
  hint = "Deslize ou use as setas para mudar de página",
  showDownloadFooter = true,
}: PdfHorizontalViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [focusPage, setFocusPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [isSpread, setIsSpread] = useState(false);

  const baseUrl = pdfUrl.split("?")[0].split("#")[0];
  const totalSpreads = spreadCount(totalPages, isSpread);
  const spreadIndex = spreadIndexForPage(focusPage, isSpread);
  const atStart = spreadIndex <= 0;
  const atEnd = totalSpreads < 1 || spreadIndex >= totalSpreads - 1;

  useEffect(() => {
    const update = () => {
      setSlideWidth(window.innerWidth);
      setIsSpread(window.innerWidth >= SPREAD_BREAKPOINT_PX);
    };
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
        setFocusPage(1);
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

  const goToSpread = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el || slideWidth < 1 || totalSpreads < 1) return;
      const i = Math.max(0, Math.min(index, totalSpreads - 1));
      const page = isSpread ? i * 2 + 1 : i + 1;
      el.scrollTo({ left: i * slideWidth, behavior: "smooth" });
      setFocusPage(page);
    },
    [slideWidth, totalSpreads, isSpread],
  );

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slideWidth < 1) return;
    const i = Math.min(
      totalSpreads - 1,
      Math.max(0, Math.round(el.scrollLeft / slideWidth)),
    );
    const page = isSpread ? i * 2 + 1 : i + 1;
    setFocusPage(page);
  }, [slideWidth, totalSpreads, isSpread]);

  useEffect(() => {
    if (slideWidth < 1 || totalSpreads < 1) return;
    const el = scrollRef.current;
    if (!el) return;
    const i = spreadIndexForPage(focusPage, isSpread);
    const clamped = Math.min(i, totalSpreads - 1);
    el.scrollTo({ left: clamped * slideWidth, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- realign scroll on layout change only
  }, [isSpread, slideWidth, totalSpreads]);

  useEffect(() => {
    if (!active || !doc) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSpread(spreadIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSpread(spreadIndex + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, doc, goToSpread, spreadIndex]);

  if (!active) return null;

  const spreadHint = isSpread
    ? " · vista de caderno (duas páginas)"
    : "";

  return (
    <div className="pdf-horizontal-wrap">
      <div className="border-y border-gold/15 bg-surface/40 px-4 py-3 text-center sm:px-6">
        <p className="font-display text-xs tracking-[0.2em] text-gold uppercase">
          {label}
        </p>
        <p className="mt-1 text-xs text-muted">
          {hint}
          {spreadHint} ·{" "}
          {pageRangeLabel(focusPage, totalPages, isSpread)}
        </p>
      </div>

      {loading && (
        <p className="py-16 text-center text-sm text-muted">A carregar documento…</p>
      )}

      {error && (
        <p className="px-4 py-16 text-center text-sm text-muted">{error}</p>
      )}

      {!loading && !error && doc && slideWidth > 0 && totalSpreads > 0 && (
        <div className="pdf-horizontal-stage relative">
          <button
            type="button"
            className="pdf-horizontal-nav pdf-horizontal-nav--prev"
            onClick={() => goToSpread(spreadIndex - 1)}
            disabled={atStart}
            aria-label="Página anterior"
          >
            <NavChevron direction="left" />
          </button>

          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="pdf-horizontal-scroll flex overflow-x-auto overscroll-x-contain"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {isSpread
              ? Array.from({ length: totalSpreads }, (_, i) => {
                  const left = i * 2 + 1;
                  const right = left + 1 <= totalPages ? left + 1 : null;
                  return (
                    <PdfSpreadSlide
                      key={`spread-${left}`}
                      doc={doc}
                      slideWidth={slideWidth}
                      leftPage={left}
                      rightPage={right}
                      isSpread
                    />
                  );
                })
              : Array.from({ length: totalPages }, (_, i) => (
                  <PdfSpreadSlide
                    key={i + 1}
                    doc={doc}
                    slideWidth={slideWidth}
                    leftPage={i + 1}
                    rightPage={null}
                    isSpread={false}
                  />
                ))}
          </div>

          <button
            type="button"
            className="pdf-horizontal-nav pdf-horizontal-nav--next"
            onClick={() => goToSpread(spreadIndex + 1)}
            disabled={atEnd}
            aria-label="Página seguinte"
          >
            <NavChevron direction="right" />
          </button>
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
