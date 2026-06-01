export type HistoriaMarco = {
  year: string;
  title: string;
  text: string;
};

const YEAR_RE = /\b(1[6-9]\d{2}|20\d{2})\b/g;
const KEYWORD_RE =
  /regimento|cavalaria|rc\s*4|ex-?rc4|santa\s+margarida|viella|extin|quartel|carrista|batalha|campbell|mouzinho|carga|efeméride|efemeride|patrono|guarnição|guarnicao/i;

/** Fallback alinhado com public/historia/marcos.json (versão B). */
const DEFAULT_MARCOS: HistoriaMarco[] = [
  {
    year: "1762",
    title: "Regimento de Mecklenburg",
    text: "Origem da linhagem que, através de sucessivas reorganizações, alimenta a tradição do Regimento de Cavalaria 4.",
  },
  {
    year: "1809",
    title: "Albergaria, Grijó e Porto",
    text: "Em 10 a 12 de maio de 1809, 105 militares sob o Tenente Sanches de Baena: combates de Albergaria e Grijó e passagem do Douro com tomada do Porto.",
  },
  {
    year: "1810",
    title: "Batalha do Buçaco",
    text: "27 de setembro de 1810 — 451 militares do RC4, sob o Major Azevedo Coutinho, na Guerra Peninsular.",
  },
  {
    year: "1811",
    title: "Batalha de Fuentes de Oñoro",
    text: "5 de maio de 1811 — 104 militares, ao comando do Capitão Casimiro Botelho.",
  },
  {
    year: "1812",
    title: "Fuente del Maestre",
    text: "3 de janeiro de 1812 — 155 militares, Capitão Maia e Vasconcellos.",
  },
  {
    year: "1812",
    title: "Arapiles",
    text: "15 e 16 de novembro de 1812 — 342 militares, Coronel John Campbell.",
  },
  {
    year: "1813",
    title: "Pirinéus",
    text: "28 e 30 de julho de 1813 — 271 militares, Coronel John Campbell, nos combates de travessia dos Pirinéus.",
  },
  {
    year: "1814",
    title: "Viella",
    text: "13 de março de 1814 — 264 cavaleiros do RC4, notável carga de Cavalaria sob o Coronel John Campbell em Viella, África; epícente da memória evocado pelo Dia do Quartel.",
  },
  {
    year: "1814",
    title: "Nérac",
    text: "31 de março de 1814 — 266 militares, Coronel John Campbell, na fase final da campanha.",
  },
  {
    year: "1827",
    title: "Guerras Liberais",
    text: "Batalha de Coruche da Beira e combates das Pontes do Prado e da Barca.",
  },
  {
    year: "1895",
    title: "Coolela (Moçambique)",
    text: "7 de novembro de 1895 — elementos do RC4 no combate de Coolela; Capitão Mouzinho de Albuquerque.",
  },
  {
    year: "1896",
    title: "Mujenga",
    text: "19 e 20 de outubro de 1896 — esquadrão do RC4, Alferes Augusto Reis.",
  },
  {
    year: "1915",
    title: "Môngua (Angola)",
    text: "18 a 20 de agosto de 1915 — 3.º Esquadrão de Cavalaria do RC4, Capitão Luizello Godinho.",
  },
  {
    year: "1915",
    title: "Socorro Cuamato–Cuanhama",
    text: "20 a 24 de agosto de 1915 — 4.º Pelotão do 3.º Esquadrão do RC4, integrado em destacamento ao comando do Tenente Correia Torres.",
  },
  {
    year: "1968–1975",
    title: "TO Angola",
    text: "Teatro de Operações em Angola — BCav 2854, 3845, 3862, 3883 e 8423/73; CCav 2720, 3377, 3418, 3419, 8450/72, 8451/72, 8453/72, 8454/73, 8455/73, 8456/73 e 8457/73.",
  },
  {
    year: "1970–1975",
    title: "TO Moçambique",
    text: "Teatro de Operações em Moçambique — BCav 2923, 3837, 3878, 8420/72, 8421/73, 8422/73 e 8424/74; CCav 2722, 2766, 2787, 3320 e 1CCav/8420/72.",
  },
  {
    year: "1970–1974",
    title: "TO Guiné",
    text: "Teatro de Operações na Guiné — CCav 2721, 3420, 3568 e CCav/8452/72.",
  },
  {
    year: "1999–2013",
    title: "FND — Kosovo",
    text: "Forças Nacionais Destacadas — Comando Agr BRAVO (1999–2000); Agr DELTA (2000–2001); Agr INDIA (2012–2013).",
  },
  {
    year: "2001–2006",
    title: "FND — Bósnia-Herzegovina",
    text: "Forças Nacionais Destacadas — ERec/Agr ECHO (2001); Cmd MNBG (2003–2004); Agr GOLF (2003–2004); 1.º Pelotão 2BIMec/SFOR (2004); GCC/BrigMec/SFOR (2006).",
  },
  {
    year: "2006",
    title: "Quartel da Cavalaria",
    text: "Casa da Arma em Santa Margarida — organização do Dia do Quartel, da Marcha a Cavalo à Batalha e das grandes atividades da comunidade O Carrista.",
  },
  {
    year: "2013–2020",
    title: "FND — Afeganistão",
    text: "Forças Nacionais Destacadas — 7.º CN/ISAF (2013–2014); 4.ª QRF/RS (2019–2020).",
  },
  {
    year: "2019–2020",
    title: "FND — Iraque",
    text: "Forças Nacionais Destacadas — 10.º CN/OIR (2019–2020).",
  },
  {
    year: "2024",
    title: "Carros de Combate em Operações",
    text: "Marco recente da capacidade operacional dos carristas — formação, emprego e experiência em operações com carros de combate.",
  },
  {
    year: "2024–2026",
    title: "FND — Eslováquia",
    text: "Forças Nacionais Destacadas — 1.º FND/PelCC (2024–2025); 2.º FND/PelCC (2025); 3.º FND/SubAgr (2025–2026); 4.º FND/SubAgr (2026).",
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
