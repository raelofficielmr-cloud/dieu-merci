import Livraison from '../models/Livraison.js';
import Succursale from '../models/Succursale.js';
import Produit from '../models/Produit.js';
import Historique from '../models/Historique.js';

// Obtenir toutes les livraisons
export const getLivraisons = async (req, res) => {
  try {
    const livraisons = await Livraison.find().sort({ createdAt: -1 });
    res.json(livraisons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une livraison
export const creerLivraison = async (req, res) => {
  try {
    const { succursaleId, date, lignes, taux } = req.body;

    const succursale = await Succursale.findById(succursaleId);
    if (!succursale) {
      return res.status(404).json({ message: 'Succursale introuvable' });
    }

    // Calcul du total
    const totalUSD = lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0);
    const totalCDF = totalUSD * taux;

    // Générer un numéro unique
    const numero = `BL-${Date.now().toString().slice(-6)}`;

    // Créer la livraison
    const livraison = await Livraison.create({
      numero,
      succursaleId,
      succursaleNom: succursale.nom,
      date,
      lignes,
      totalUSD,
      totalCDF,
      taux,
    });

    // Mettre à jour la dette de la succursale
    succursale.detteActuelle += totalUSD;
    await succursale.save();

    // Ajouter à l'historique
    await Historique.create({
      date,
      type: 'Livraison',
      succursale: succursale.nom,
      montant: totalUSD,
      utilisateur: 'Informaticien',
    });

    res.status(201).json(livraison);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une livraison
export const supprimerLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findByIdAndDelete(req.params.id);
    if (!livraison) {
      return res.status(404).json({ message: 'Livraison introuvable' });
    }
    res.json({ message: 'Livraison supprimée', livraison });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};