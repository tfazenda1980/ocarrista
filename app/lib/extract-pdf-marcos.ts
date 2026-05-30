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
    year: "1762",
    title: "Regimento de Mecklenburg",
    text: "Origem da linhagem que, através de sucessivas reorganizações, viria a marcar a tradição de cavalaria portuguesa que o RC4 honraria.",
  },
  {
    year: "1810",
    title: "Batalha do Buçaco",
    text: "Presença e bravura da cavalaria portuguesa nas campanhas da Península Ibérica.",
  },
  {
    year: "1811",
    title: "Batalha de Fuentes de Oñoro",
    text: "Mais um marco das campanhas napoleónicas em que a cavalaria portuguesa se distinguiu.",
  },
  {
    year: "1812",
    title: "Combate de Fuentes del Maestro",
    text: "Continuidade do esforço de guerra na Península, consagrando a experiência da Arma.",
  },
  {
    year: "1813",
    title: "Pirenéus",
    text: "Atravessamento e combates nos Pirenéus, no culminar da participação portuguesa nas guerras napoleónicas.",
  },
  {
    year: "1814",
    title: "Viella",
    text: "Combate em Viella, com a notável carga de cavalaria ao comando do Coronel John Campbell — epícente da memória do regimento.",
  },
  {
    year: "1895",
    title: "Coolela",
    text: "Campanha em África: o regimento marca presença em Coolela, afirmando a cavalaria portuguesa no continente.",
  },
  {
    year: "1896",
    title: "Mujenga",
    text: "Em Mujenga, novo episódio operacional que reforça o prestígio e a experiência combativa da unidade.",
  },
  {
    year: "1914/15",
    title: "Cuamato",
    text: "Combate em Cuamato, no âmbito da campanha de Angola durante a Grande Guerra.",
  },
  {
    year: "1914/15",
    title: "Cuanhama",
    text: "Combate em Cuanhama, reforçando o papel da cavalaria portuguesa nas operações do período.",
  },
  {
    year: "1915",
    title: "Môngua",
    text: "Em Môngua, durante a Grande Guerra, a cavalaria portuguesa volta a escrever páginas de sacrifício e valor.",
  },
  {
    year: "2006",
    title: "Quartel da Cavalaria",
    text: "O Quartel da Cavalaria assume o papel de casa da Arma e de organização das grandes atividades — da Marcha à Batalha ao convívio da comunidade.",
  },
  {
    year: "2024",
    title: "Carros de Combate em Operações",
    text: "Marco recente da capacidade operacional dos carristas — formação, emprego e experiência em operações com carros de combate.",
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
