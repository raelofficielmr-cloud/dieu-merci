import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const utilisateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: ['Proprietaire', 'Informaticien'], required: true },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash le mot de passe avant sauvegarde
utilisateurSchema.pre('save', async function () {
  if (!this.isModified('motDePasse')) return;
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

// Méthode pour comparer les mots de passe
utilisateurSchema.methods.comparerMotDePasse = async function (mdp) {
  return await bcrypt.compare(mdp, this.motDePasse);
};

export default mongoose.model('Utilisateur', utilisateurSchema);