import catalog from "../../../content/loja/products.json";

export type LojaProduct = {
  id: string;
  name: string;
  note: string;
};

export function getLojaProducts(): LojaProduct[] {
  return catalog.products as LojaProduct[];
}

export function getLojaProductIds(): string[] {
  return getLojaProducts().map((p) => p.id);
}
