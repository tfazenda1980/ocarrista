export type CncPdfResource = {
  label: string;
  /** Caminho público, ex. /eventos/cnc/2026/iniciacao/ordens.pdf */
  href: string | null;
};

export type CncDisciplineResources = {
  ordens: CncPdfResource;
  croquis: CncPdfResource;
  resultados: CncPdfResource;
};

export type CncDiscipline = {
  id: string;
  title: string;
  description?: string;
  /** Ordens, croquis e resultados (provas competitivas). */
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
  name: string;
  logo: string;
  url: string;
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
  disciplines: CncDiscipline[];
  usefulInfo: CncUsefulInfoItem[];
  contacts: {
    organizer: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  sponsors: CncSponsor[];
};
