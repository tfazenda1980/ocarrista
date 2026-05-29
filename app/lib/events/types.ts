export type EventTheme = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
};

export type EventSession = {
  time: string;
  title: string;
  speaker?: string;
  highlight?: boolean;
};

export type EventPanel = {
  name: string;
  sessions: EventSession[];
};

export type EventSpeaker = {
  id: string;
  name: string;
  role: string;
  bio: string;
  bioLong?: string;
  image?: string;
};

export type EventGalleryItem = {
  src: string;
  alt: string;
  type: "image" | "video";
};

export type EventData = {
  slug: string;
  title: string;
  edition: string;
  slogan: string;
  date: string;
  dateDisplay: string;
  location: string;
  heroImage: string;
  cardImage: string;
  purpose: string;
  objectives: string[];
  themes: EventTheme[];
  panels: EventPanel[];
  speakers: EventSpeaker[];
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
    privacy: string;
    terms: string;
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
