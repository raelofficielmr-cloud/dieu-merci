import mongoose from 'mongoose';

const historiqueSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, enum: ['Livraison', 'Approvisionnement', 'Versement'], required: true },
    succursale: { type: String, default: '' },
    montant: { type: Number, default: 0 },
    produit: { type: String, default: '' },
    quantite: { type: Number, default: 0 },
    unite: { type: String, default: '' },
    utilisateur: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Historique', historiqueSchema);