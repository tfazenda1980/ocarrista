/** Pin of the Cavalry Barracks when the country is marked as host. */
export const IMGC_HOST_PIN = { lat: 39.45, lng: -8.33, city: "Santa Margarida" };

type CountryEntry = {
  official: string;
  aliases?: string[];
  lat: number;
  lng: number;
};

/**
 * Official short names (English) plus Portuguese/common aliases.
 * Coordinates are the capital, used only to place the map pin.
 */
const COUNTRIES: CountryEntry[] = [
  { official: "Afghanistan", aliases: ["Afeganistão"], lat: 34.53, lng: 69.17 },
  { official: "Albania", aliases: ["Albânia"], lat: 41.33, lng: 19.82 },
  { official: "Algeria", aliases: ["Argélia"], lat: 36.75, lng: 3.06 },
  { official: "Angola", lat: -8.84, lng: 13.23 },
  { official: "Argentina", lat: -34.6, lng: -58.38 },
  { official: "Armenia", aliases: ["Arménia", "Armênia"], lat: 40.18, lng: 44.51 },
  { official: "Australia", aliases: ["Austrália"], lat: -35.28, lng: 149.13 },
  { official: "Austria", aliases: ["Áustria"], lat: 48.21, lng: 16.37 },
  { official: "Azerbaijan", aliases: ["Azerbaijão"], lat: 40.41, lng: 49.87 },
  { official: "Bahrain", aliases: ["Barém", "Bahrein"], lat: 26.23, lng: 50.59 },
  { official: "Bangladesh", lat: 23.81, lng: 90.41 },
  { official: "Belgium", aliases: ["Bélgica"], lat: 50.85, lng: 4.35 },
  { official: "Bosnia and Herzegovina", aliases: ["Bósnia e Herzegovina", "Bosnia"], lat: 43.86, lng: 18.41 },
  { official: "Brazil", aliases: ["Brasil"], lat: -15.79, lng: -47.88 },
  { official: "Bulgaria", aliases: ["Bulgária"], lat: 42.7, lng: 23.32 },
  { official: "Canada", aliases: ["Canadá"], lat: 45.42, lng: -75.7 },
  { official: "Chile", lat: -33.45, lng: -70.67 },
  { official: "China", aliases: ["People's Republic of China", "China, People's Republic of"], lat: 39.9, lng: 116.41 },
  { official: "Colombia", aliases: ["Colômbia"], lat: 4.71, lng: -74.07 },
  { official: "Croatia", aliases: ["Croácia"], lat: 45.81, lng: 15.98 },
  { official: "Cyprus", aliases: ["Chipre"], lat: 35.17, lng: 33.36 },
  { official: "Czechia", aliases: ["Czech Republic", "República Checa", "Chequia"], lat: 50.08, lng: 14.44 },
  { official: "Denmark", aliases: ["Dinamarca"], lat: 55.68, lng: 12.57 },
  { official: "Egypt", aliases: ["Egipto", "Egito"], lat: 30.04, lng: 31.24 },
  { official: "Estonia", aliases: ["Estónia", "Estônia"], lat: 59.44, lng: 24.75 },
  { official: "Finland", aliases: ["Finlândia"], lat: 60.17, lng: 24.94 },
  { official: "France", aliases: ["França"], lat: 48.86, lng: 2.35 },
  { official: "Georgia", aliases: ["Geórgia"], lat: 41.72, lng: 44.79 },
  { official: "Germany", aliases: ["Alemanha", "Deutschland"], lat: 52.52, lng: 13.4 },
  { official: "Greece", aliases: ["Grécia"], lat: 37.98, lng: 23.73 },
  { official: "Hungary", aliases: ["Hungria"], lat: 47.5, lng: 19.04 },
  { official: "Iceland", aliases: ["Islândia"], lat: 64.15, lng: -21.94 },
  { official: "India", aliases: ["Índia"], lat: 28.61, lng: 77.21 },
  { official: "Indonesia", aliases: ["Indonésia"], lat: -6.21, lng: 106.85 },
  { official: "Iraq", aliases: ["Iraque"], lat: 33.32, lng: 44.37 },
  { official: "Ireland", aliases: ["Irlanda", "Republic of Ireland"], lat: 53.35, lng: -6.26 },
  { official: "Israel", lat: 31.77, lng: 35.22 },
  { official: "Italy", aliases: ["Itália"], lat: 41.9, lng: 12.5 },
  { official: "Japan", aliases: ["Japão"], lat: 35.68, lng: 139.76 },
  { official: "Jordan", aliases: ["Jordânia"], lat: 31.95, lng: 35.93 },
  { official: "Kazakhstan", aliases: ["Cazaquistão"], lat: 51.17, lng: 71.43 },
  { official: "Kuwait", aliases: ["Koweit"], lat: 29.38, lng: 47.99 },
  { official: "Latvia", aliases: ["Letónia", "Letônia"], lat: 56.95, lng: 24.11 },
  { official: "Lithuania", aliases: ["Lituânia"], lat: 54.69, lng: 25.28 },
  { official: "Luxembourg", aliases: ["Luxemburgo"], lat: 49.61, lng: 6.13 },
  { official: "Malaysia", aliases: ["Malásia"], lat: 3.14, lng: 101.69 },
  { official: "Mexico", aliases: ["México"], lat: 19.43, lng: -99.13 },
  { official: "Montenegro", lat: 42.43, lng: 19.26 },
  { official: "Morocco", aliases: ["Marrocos"], lat: 34.02, lng: -6.84 },
  { official: "Mozambique", aliases: ["Moçambique"], lat: -25.97, lng: 32.57 },
  { official: "Netherlands", aliases: ["Holanda", "Países Baixos", "Holland"], lat: 52.37, lng: 4.89 },
  { official: "New Zealand", aliases: ["Nova Zelândia"], lat: -41.29, lng: 174.78 },
  { official: "Nigeria", aliases: ["Nigéria"], lat: 9.08, lng: 7.4 },
  { official: "North Macedonia", aliases: ["Macedonia", "Macedónia", "Macedônia"], lat: 41.99, lng: 21.43 },
  { official: "Norway", aliases: ["Noruega"], lat: 59.91, lng: 10.75 },
  { official: "Oman", aliases: ["Omã"], lat: 23.59, lng: 58.41 },
  { official: "Pakistan", aliases: ["Paquistão"], lat: 33.68, lng: 73.05 },
  { official: "Peru", aliases: ["Perú"], lat: -12.05, lng: -77.04 },
  { official: "Philippines", aliases: ["Filipinas"], lat: 14.6, lng: 120.98 },
  { official: "Poland", aliases: ["Polónia", "Polônia"], lat: 52.23, lng: 21.01 },
  { official: "Portugal", lat: 38.72, lng: -9.14 },
  { official: "Qatar", aliases: ["Catar"], lat: 25.29, lng: 51.53 },
  { official: "Republic of Korea", aliases: ["South Korea", "Korea", "Coreia do Sul", "South Korea (Republic of Korea)"], lat: 37.57, lng: 126.98 },
  { official: "Romania", aliases: ["Roménia", "Romênia"], lat: 44.43, lng: 26.1 },
  { official: "Saudi Arabia", aliases: ["Arábia Saudita"], lat: 24.71, lng: 46.68 },
  { official: "Serbia", aliases: ["Sérvia"], lat: 44.82, lng: 20.46 },
  { official: "Singapore", aliases: ["Singapura"], lat: 1.35, lng: 103.82 },
  { official: "Slovakia", aliases: ["Eslováquia"], lat: 48.15, lng: 17.11 },
  { official: "Slovenia", aliases: ["Eslovénia", "Eslovênia"], lat: 46.05, lng: 14.51 },
  { official: "South Africa", aliases: ["África do Sul"], lat: -25.75, lng: 28.23 },
  { official: "Spain", aliases: ["Espanha"], lat: 40.42, lng: -3.7 },
  { official: "Sweden", aliases: ["Suécia"], lat: 59.33, lng: 18.07 },
  { official: "Switzerland", aliases: ["Suíça"], lat: 46.95, lng: 7.45 },
  { official: "Thailand", aliases: ["Tailândia"], lat: 13.76, lng: 100.5 },
  { official: "Tunisia", aliases: ["Tunísia"], lat: 36.81, lng: 10.18 },
  { official: "Turkey", aliases: ["Türkiye", "Turquia"], lat: 39.93, lng: 32.86 },
  { official: "Ukraine", aliases: ["Ucrânia"], lat: 50.45, lng: 30.52 },
  { official: "United Arab Emirates", aliases: ["UAE", "Emirados Árabes Unidos"], lat: 24.45, lng: 54.38 },
  { official: "United Kingdom", aliases: ["UK", "Great Britain", "Britain", "Reino Unido", "England"], lat: 51.51, lng: -0.13 },
  { official: "United States of America", aliases: ["United States", "USA", "US", "Estados Unidos", "Estados Unidos da América"], lat: 38.9, lng: -77.04 },
  { official: "Uruguay", aliases: ["Uruguai"], lat: -34.9, lng: -56.19 },
  { official: "Uzbekistan", aliases: ["Usbequistão"], lat: 41.3, lng: 69.24 },
  { official: "Vietnam", aliases: ["Vietname", "Vietnã"], lat: 21.03, lng: 105.85 },
];

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const byName = new Map<string, CountryEntry>();
for (const entry of COUNTRIES) {
  byName.set(fold(entry.official), entry);
  for (const alias of entry.aliases ?? []) {
    byName.set(fold(alias), entry);
  }
}

export const IMGC_COUNTRY_NAMES = COUNTRIES.map((entry) => entry.official).sort((a, b) =>
  a.localeCompare(b),
);

export type ImgcCountryPin = {
  officialName: string;
  lat: number;
  lng: number;
};

export function resolveImgcCountry(name: string): ImgcCountryPin | null {
  const entry = byName.get(fold(name));
  if (!entry) return null;
  return { officialName: entry.official, lat: entry.lat, lng: entry.lng };
}

export function pinForImgcDelegation(
  country: string,
  host?: boolean,
): ImgcCountryPin & { city?: string } {
  const resolved = resolveImgcCountry(country);
  if (!resolved) {
    throw new Error(
      `País não reconhecido: «${country.trim()}». Use o nome oficial (ex. United Kingdom, Alemanha, Spain).`,
    );
  }
  if (host) {
    return {
      officialName: resolved.officialName,
      lat: IMGC_HOST_PIN.lat,
      lng: IMGC_HOST_PIN.lng,
      city: IMGC_HOST_PIN.city,
    };
  }
  return resolved;
}
