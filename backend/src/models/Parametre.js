import mongoose from 'mongoose';

const parametreSchema = new mongoose.Schema(
  {
    tauxDuJour: { type: Number, default: 2350 },
    nomEntreprise: { type: String, default: 'Ets DIEU MERCI' },
    adresse: { type: String, default: 'Nganadjika, Q. Kalubanda, Av. Mobutu, N° 16' },
    telephone: { type: String, default: '+243 852 845 253' },
  },
  { timestamps: true }
);

export default mongoose.model('Parametre', parametreSchema);