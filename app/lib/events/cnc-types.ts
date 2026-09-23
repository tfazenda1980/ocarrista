export type CncPdfResource = {
  label: string;
  /** Caminho público ou URL Blob, ex. /eventos/cnc/2026/iniciacao/ordens.pdf */
  href: string | null;
  mime?: string | null;
  filename?: string | null;
};

export type CncDisciplineResources = {
  ordens: CncPdfResource;
  croquis: CncPdfResource;
  resultados: CncPdfResource;
};

export type CncDisciplineSection = {
  id: string;
  title: string;
  /** Ordens, croquis e resultados da fase ou prova. */
  resources?: CncDisciplineResources;
  /** Um único documento (ex. resultados finais). */
  resultados?: CncPdfResource;
};

export type CncDiscipline = {
  id: string;
  title: string;
  description?: string;
  /** Subsetores (Ensino/Cross/Obstáculos, provas Open, etc.). */
  sections?: CncDisciplineSection[];
  /** Ordens, croquis e resultados (provas competitivas sem subsetores). */
  resources?: CncDisciplineResources;
  /** PDF em largura total — galeria fotográfica de prémios por prova. */
  galleryPdf?: CncPdfResource;
};

export type CncUsefulInfoItem = {
  id: string;
  title: string;
  description?: string;
  pdf: CncPdfResource;
};

export type CncSponsor = {
  id: string;
  name: string;
  logo: string;
  url: string;
};

export type CncNotice = {
  id: string;
  body: string;
  active: boolean;
  createdAt: string;
};

export type CncGalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

export type CncSeries = {
  slug: string;
  title: string;
  defaultYear: string;
  years: string[];
};

export type CncEventData = {
  year: string;
  slug: string;
  published: boolean;
  title: string;
  edition: string;
  slogan: string;
  rationale: string;
  date: string;
  /** Último dia do evento; se faltar, usa o dia de `date`. */
  endDate?: string;
  dateDisplay: string;
  location: string;
  heroImage: string;
  cardImage: string;
  seo: { title: string; description: string };
  openingNote: {
    title: string;
    body: string;
    pdf: CncPdfResource | null;
  };
  generalProgram: {
    title: string;
    body: string;
    pdf: CncPdfResource | null;
  };
  regulation: {
    title: string;
    body: string;
    pdf: CncPdfResource | null;
  };
  disciplines: CncDiscipline[];
  usefulInfo: CncUsefulInfoItem[];
  contacts: {
    organizer: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  sponsors: CncSponsor[];
  photoGallery: CncGalleryPhoto[];
  /** Avisos do dia publicados pela organização. */
  notices: CncNotice[];
};
