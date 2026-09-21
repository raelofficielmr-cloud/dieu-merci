export interface ProduitStock {
  id: number;
  nom: string;
  description: string;
  poids: number;
  quantite: number;
  unite: string;
  prixUnitaire: number;      // Prix de vente par pièce (0 = non défini)
  prixVenteLot: number;      // Prix de vente par lot
  prixAchat: number;         // Prix d'achat unitaire
  marge: number;             // Marge en %
  piecesParLot: number;      // Nombre de pièces par lot
  lotGros: number;           // Lot de gros/douzaine/sizaine
  sousUnite: string;         // Sous-unité de sortie
  categorie: string;
}

export const categoriesDisponibles = [
  'Alimentation',
  'Construction',
  'Cosmétique',
  'Divers',
  'Pièces Moto',
  'Pièces Vélo',
];

export const unitesDisponibles = [
  'Pièces',
  'Boîtes',
  'Douzaines',
  'Cartons',
  'Sacs',
  'Kg',
  'Litres',
];

export const produitsInitiaux: ProduitStock[] = [
  {
    id: 1,
    nom: 'BOUGIE DT',
    description: '1 Pcs dans chaque Boite',
    poids: 0,
    quantite: 5,
    unite: 'Boîtes',
    prixUnitaire: 0,
    prixVenteLot: 0,
    prixAchat: 0,
    marge: 5,
    piecesParLot: 1,
    lotGros: 1,
    sousUnite: 'Boîtes',
    categorie: 'Alimentation',
  },
  {
    id: 2,
    nom: 'CADENAS',
    description: '1 Pcs dans chaque Douzaine',
    poids: 0,
    quantite: 25,
    unite: 'Douzaines',
    prixUnitaire: 0,
    prixVenteLot: 0,
    prixAchat: 0,
    marge: 5,
    piecesParLot: 1,
    lotGros: 1,
    sousUnite: 'Douzaines',
    categorie: 'Divers',
  },
  {
    id: 3,
    nom: 'CHAPA MANDASHI',
    description: '1 Pcs dans chaque Carton',
    poids: 0,
    quantite: 5,
    unite: 'Cartons',
    prixUnitaire: 0,
    prixVenteLot: 0,
    prixAchat: 0,
    marge: 5,
    piecesParLot: 1,
    lotGros: 1,
    sousUnite: 'Cartons',
    categorie: 'Alimentation',
  },
];