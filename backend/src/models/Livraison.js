import mongoose from 'mongoose';

const ligneLivraisonSchema = new mongoose.Schema({
  produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
  nom: { type: String, required: true },
  quantite: { type: Number, required: true },
  unite: { type: String, required: true },
  prixUnitaire: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const livraisonSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    succursaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Succursale', required: true },
    succursaleNom: { type: String, required: true },
    date: { type: Date, required: true },
    lignes: [ligneLivraisonSchema],
    totalUSD: { type: Number, default: 0 },
    totalCDF: { type: Number, default: 0 },
    taux: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Livraison', livraisonSchema);