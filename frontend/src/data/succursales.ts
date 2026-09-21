export interface Versement {
  id: number;
  date: string;        // YYYY-MM-DD
  verseUSD: number;
  verseCDF: number;
  taux: number;
  reste: number;       // dette après ce versement (USD)
}

export interface Succursale {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  detteActuelle: number;   // en USD
  versements: Versement[]; // du plus récent au plus ancien
}

export const succursalesInitiales: Succursale[] = [
  {
    id: 1,
    nom: 'Cotonnière',
    adresse: 'Cotonnière',
    telephone: '123456789',
    detteActuelle: 1282.44,
    versements: [
      { id: 1, date: '2026-09-14', verseUSD: 0, verseCDF: 115000000, taux: 2350, reste: -94 },
      { id: 2, date: '2026-09-03', verseUSD: 0, verseCDF: 238000000, taux: 2350, reste: -201 },
      { id: 3, date: '2026-09-03', verseUSD: 0, verseCDF: 685000000, taux: 2350, reste: 811 },
    ],
  },
  {
    id: 2,
    nom: 'Direction',
    adresse: 'Petit marché',
    telephone: '013345678',
    detteActuelle: 35959.33,
    versements: [
      { id: 1, date: '2026-09-13', verseUSD: 0, verseCDF: 100000000, taux: 2350, reste: 4 },
      { id: 2, date: '2026-09-13', verseUSD: 50000, verseCDF: 0, taux: 2350, reste: 4 },
      { id: 3, date: '2026-09-03', verseUSD: 18000, verseCDF: 0, taux: 2350, reste: 4 },
    ],
  },
];