export type HistoriaMarco = {
  year: string;
  title: string;
  text: string;
};

const YEAR_RE = /\b(1[6-9]\d{2}|20\d{2})\b/g;
const KEYWORD_RE =
  /regimento|cavalaria|rc\s*4|ex-?rc4|santa\s+margarida|viella|extin|quartel|carrista|batalha|campbell|mouzinho|carga|efeméride|efemeride|patrono|guarnição|guarnicao/i;

const DEFAULT_MARCOS: HistoriaMarco[] = [
  {
    year: "1927",
    title: "Regimento de Cavalaria 4",
    text: "O RC4 nasce em Santa Margarida, forjando gerações de cavaleiros e, mais tarde, carristas nas forças blindadas portuguesas.",
  },
  {
    year: "1993",
    title: "Extinção e Legado",
    text: "Com a reorganização do Exército, o regimento é extinto — mas a memória, o quartel e o espírito Ex-RC4 permanecem vivos.",
  },
  {
    year: "Hoje",
    title: "O Carrista",
    text: "Comunidade que une veteranos, famílias e amigos em torno da história do RC4, dos eventos anuais e da identidade de Santa Margarida.",
  },
];

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 420);
}

function yearSortKey(year: string): number {
  if (year.toLowerCase() === "hoje") return 9999;
  const n = parseInt(year, 10);
  return Number.isNaN(n) ? 0 : n;
}

function titleFromSentence(sentence: string, year: string): string {
  const cleaned = sentence.replace(YEAR_RE, "").trim();
  const words = cleaned.split(/\s+/).slice(0, 6).join(" ");
  if (words.length > 12) return words;
  return `Marco de ${year}`;
}

function scoreSentence(sentence: string): number {
  let score = 0;
  if (KEYWORD_RE.test(sentence)) score += 4;
  if (/\b(RC\s*4|Regimento de Cavalaria)\b/i.test(sentence)) score += 3;
  if (sentence.length > 80 && sentence.length < 280) score += 2;
  return score;
}

/** Extrai marcos cronológicos a partir do texto do PDF (heurística — rever se necessário). */
export function marcosFromPdfText(fullText: string, maxMarcos = 8): HistoriaMarco[] {
  const byYear = new Map<string, { sentence: string; score: number }>();

  for (const sentence of splitSentences(fullText)) {
    const years = [...sentence.matchAll(YEAR_RE)].map((m) => m[1]);
    if (years.length === 0) continue;

    const sc = scoreSentence(sentence);
    if (sc < 2) continue;

    for (const year of years) {
      const prev = byYear.get(year);
      if (!prev || sc > prev.score) {
        byYear.set(year, { sentence, score: sc });
      }
    }
  }

  const sorted = [...byYear.entries()]
    .sort(([a], [b]) => yearSortKey(a) - yearSortKey(b))
    .slice(0, maxMarcos);

  if (sorted.length < 2) return DEFAULT_MARCOS;

  return sorted.map(([year, { sentence }]) => ({
    year,
    title: titleFromSentence(sentence, year),
    text: sentence.length > 320 ? `${sentence.slice(0, 317)}…` : sentence,
  }));
}

export async function loadMarcosFromJson(): Promise<HistoriaMarco[] | null> {
  try {
    const res = await fetch("/historia/marcos.json", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as HistoriaMarco[];
    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

export async function loadMarcosFromPdf(pdfUrl: string): Promise<HistoriaMarco[]> {
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const doc = await pdfjs.getDocument(pdfUrl).promise;
    const parts: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      parts.push(pageText);
    }

    const marcos = marcosFromPdfText(parts.join("\n\n"));
    return marcos.length >= 2 ? marcos : DEFAULT_MARCOS;
  } catch {
    return DEFAULT_MARCOS;
  }
}

export { DEFAULT_MARCOS };
