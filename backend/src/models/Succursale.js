import mongoose from 'mongoose';

const succursaleSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    adresse: { type: String, default: '' },
    telephone: { type: String, default: '' },
    detteActuelle: { type: Number, default: 0 },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Succursale', succursaleSchema);