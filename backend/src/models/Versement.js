import mongoose from 'mongoose';

const versementSchema = new mongoose.Schema(
  {
    succursaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Succursale', required: true },
    succursaleNom: { type: String, required: true },
    date: { type: Date, required: true },
    verseUSD: { type: Number, default: 0 },
    verseCDF: { type: Number, default: 0 },
    taux: { type: Number, required: true },
    reste: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Versement', versementSchema);