import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const utilisateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: ['Proprietaire', 'Informaticien'], required: true },
    actif: { type: Boolean, default: true },
    questionSecurite: { type: String, default: '' },
    reponseSecurite: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hash le mot de passe
utilisateurSchema.pre('save', async function () {
  if (!this.isModified('motDePasse')) return;
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

// Hash la réponse de sécurité (minuscules + trim)
utilisateurSchema.pre('save', async function () {
  if (!this.isModified('reponseSecurite')) return;
  if (!this.reponseSecurite) return;
  const salt = await bcrypt.genSalt(10);
  this.reponseSecurite = await bcrypt.hash(
    this.reponseSecurite.toLowerCase().trim(),
    salt
  );
});

// Comparer les mots de passe
utilisateurSchema.methods.comparerMotDePasse = async function (mdp) {
  return await bcrypt.compare(mdp, this.motDePasse);
};

// Comparer les réponses de sécurité
utilisateurSchema.methods.comparerReponse = async function (reponse) {
  return await bcrypt.compare(reponse.toLowerCase().trim(), this.reponseSecurite);
};

export default mongoose.model('Utilisateur', utilisateurSchema);