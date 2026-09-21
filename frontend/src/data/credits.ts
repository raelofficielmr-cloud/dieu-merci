export interface Credit {
  id: number;
  client: string;
  montant: number;
  date: string;
  boutique: string;
}

export const creditsInitiaux: Credit[] = [
  { id: 1, client: 'Jean Mukendi', montant: 150, date: '2026-09-10', boutique: 'Boutique Centrale' },
  { id: 2, client: 'Marie Kabila', montant: 80, date: '2026-09-12', boutique: 'Point de Vente 1' },
  { id: 3, client: 'Paul Ilunga', montant: 250, date: '2026-09-14', boutique: 'Point de Vente 2' },
];