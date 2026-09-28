export type ImgcPdfResource = {
  label: string;
  href: string | null;
  mime?: string | null;
  filename?: string | null;
};

export type ImgcDelegation = {
  id: string;
  country: string;
  city?: string;
  lat: number;
  lng: number;
  host?: boolean;
};

export type ImgcLinkCategory = "tomar" | "transport" | "stay" | "other";

export type ImgcLink = {
  id: string;
  category: ImgcLinkCategory;
  title: string;
  url: string;
  description?: string;
};

export type ImgcGalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

export type ImgcMessage = {
  id: string;
  year: string;
  name: string;
  email: string;
  body: string;
  createdAt: string;
};

export type ImgcSeries = {
  slug: string;
  title: string;
  defaultYear: string;
  years: string[];
};

export type ImgcEventData = {
  year: string;
  slug: string;
  published: boolean;
  title: string;
  edition: string;
  slogan: string;
  date: string;
  endDate: string;
  dateDisplay: string;
  location: string;
  heroImage: string;
  cardImage: string;
  about: { title: string; body: string };
  barracks: { title: string; body: string };
  practical: { title: string; body: string };
  programme: { title: string; body: string; pdf: ImgcPdfResource };
  delegations: ImgcDelegation[];
  links: ImgcLink[];
  photoGallery: ImgcGalleryPhoto[];
  contacts: {
    organizer: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  seo: {
    title: string;
    description: string;
  };
};
