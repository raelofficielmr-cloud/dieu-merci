export interface LigneLivraison {
  produitId: number;
  nom: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;    // USD
  total: number;           // USD
}

export interface Livraison {
  id: number;
  numero: string;
  succursale: string;
  date: string;
  lignes: LigneLivraison[];
  totalUSD: number;
  totalCDF: number;
}