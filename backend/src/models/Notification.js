import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    destinataire: {
      type: String,
      enum: ['Proprietaire', 'Informaticien'],
      default: 'Proprietaire',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'StockBas',
        'Approvisionnement',
        'Sortie',
        'Livraison',
        'Versement',
        'NouveauProduit',
        'Suppression',
        'MotDePasse',
        'NouvelleSuccursale',
      ],
      required: true,
    },
    titre: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    lu: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);