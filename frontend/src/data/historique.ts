export type TypeActivite = 'Livraison' | 'Approvisionnement' | 'Versement';

export interface ActiviteHistorique {
  id: number;
  date: string;          // YYYY-MM-DD
  type: TypeActivite;
  // Pour Livraison et Versement
  succursale?: string;
  montant?: number;      // USD
  // Pour Approvisionnement
  produit?: string;
  quantite?: number;
  unite?: string;
}

export const historiqueInitial: ActiviteHistorique[] = [
  // Livraisons
  { id: 1, date: '2026-09-18', type: 'Livraison', succursale: 'Direction', montant: 6485.05 },
  { id: 2, date: '2026-09-18', type: 'Livraison', succursale: 'Direction', montant: 7693.70 },
  { id: 3, date: '2026-09-15', type: 'Livraison', succursale: 'Cotonnière', montant: 3500.00 },

  // Approvisionnements
  { id: 4, date: '2026-09-18', type: 'Approvisionnement', produit: 'BOUGIE DT', quantite: 100, unite: 'Boîtes' },
  { id: 5, date: '2026-09-17', type: 'Approvisionnement', produit: 'CADENAS', quantite: 50, unite: 'Douzaines' },
  { id: 6, date: '2026-09-16', type: 'Approvisionnement', produit: 'CHAPA MANDASHI', quantite: 30, unite: 'Cartons' },

  // Versements
  { id: 7, date: '2026-09-18', type: 'Versement', succursale: 'Cotonnière', montant: 500.00 },
  { id: 8, date: '2026-09-17', type: 'Versement', succursale: 'Direction', montant: 1200.00 },
  { id: 9, date: '2026-09-16', type: 'Versement', succursale: 'Cotonnière', montant: 800.00 },
  { id: 10, date: '2026-09-10', type: 'Versement', succursale: 'Direction', montant: 2500.00 },
];