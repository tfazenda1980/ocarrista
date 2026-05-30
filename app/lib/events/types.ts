export type EventTheme = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
};

export type EventSessionKind =
  | "session"
  | "section"
  | "break"
  | "meal"
  | "activity";

export type EventSession = {
  time: string;
  endTime?: string;
  duration?: string;
  title: string;
  description?: string;
  speaker?: string;
  highlight?: boolean;
  kind?: EventSessionKind;
  /** Sala de perguntas ao debate (`debate-painel-1` | `debate-painel-2`) */
  qaRoom?: "debate-painel-1" | "debate-painel-2";
};

export type EventPanel = {
  name: string;
  /** Liga o painel a um eixo (theme.id). Sem axisId = bloco transversal. */
  axisId?: string;
  sessions: EventSession[];
};

export type EventSpeaker = {
  id: string;
  name: string;
  role: string;
  bio: string;
  bioLong?: string;
  image?: string;
  /** Eixo do painel em que participa */
  axisId?: string;
};

export type EventModerator = {
  id: string;
  name: string;
  axisId?: string;
};

export type EventGalleryItem = {
  src: string;
  alt: string;
  type: "image" | "video";
};

export type WorkshopSeries = {
  slug: string;
  title: string;
  defaultYear: string;
  years: string[];
};

export type EventData = {
  year: string;
  slug: string;
  published?: boolean;
  placeholderMessage?: string;
  title: string;
  edition: string;
  slogan: string;
  date: string;
  dateDisplay: string;
  location: string;
  heroImage?: string;
  cardImage?: string;
  purpose: string;
  objectives: string[];
  themes: EventTheme[];
  panels: EventPanel[];
  speakers: EventSpeaker[];
  moderators?: EventModerator[];
  /** Destaque fora da agenda (ex.: Challenger — Pista Final) */
  spotlight?: EventSession;
  gallery: EventGalleryItem[];
  registration: {
    enabled: boolean;
    cta: string;
    note?: string;
  };
  seo: {
    title: string;
    description: string;
  };
  contacts: {
    email: string;
    organizer?: string;
    phone?: string;
  };
  legal?: {
    terms?: string;
  };
};

export type EventListItem = {
  slug: string;
  title: string;
  meta?: string;
  description: string;
  cardImage?: string;
  href: string;
  teaserHref?: string;
};
