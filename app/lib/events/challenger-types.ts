export type ChallengerSeries = {
  slug: string;
  title: string;
  defaultYear: string;
  years: string[];
};

export type ChallengerEventData = {
  year: string;
  slug: string;
  published: boolean;
  title: string;
  edition: string;
  slogan: string;
  purpose: string;
  date: string;
  dateDisplay: string;
  location: string;
  heroImage: string;
  cardImage: string;
  seo: {
    title: string;
    description: string;
  };
  contacts: {
    email: string;
    organizer: string;
  };
};
