import mongoose from 'mongoose';

const produitSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    poids: { type: Number, default: 0 },
    quantite: { type: Number, default: 0 },
    unite: { type: String, default: 'Pièces' },
    sousUnite: { type: String, default: '' },
    prixUnitaire: { type: Number, default: 0 },
    prixVenteLot: { type: Number, default: 0 },
    prixAchat: { type: Number, default: 0 },
    marge: { type: Number, default: 5 },
    piecesParLot: { type: Number, default: 1 },
    lotGros: { type: Number, default: 1 },
    categorie: { type: String, default: 'Divers' },
    seuilAlerte: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.model('Produit', produitSchema);