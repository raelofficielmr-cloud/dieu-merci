import Livraison from '../models/Livraison.js';
import Succursale from '../models/Succursale.js';
import Historique from '../models/Historique.js';
import { creerNotification } from './notificationController.js';

export const getLivraisons = async (req, res) => {
  try {
    const livraisons = await Livraison.find().sort({ createdAt: -1 });
    res.json(livraisons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const creerLivraison = async (req, res) => {
  try {
    const { succursaleId, date, lignes, taux } = req.body;

    const succursale = await Succursale.findById(succursaleId);
    if (!succursale) return res.status(404).json({ message: 'Succursale introuvable' });

    const totalUSD = lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0);
    const totalCDF = totalUSD * taux;
    const numero = `BL-${Date.now().toString().slice(-6)}`;

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

    succursale.detteActuelle += totalUSD;
    await succursale.save();

    await Historique.create({
      date,
      type: 'Livraison',
      succursale: succursale.nom,
      montant: totalUSD,
      utilisateur: 'Informaticien',
    });

    // Notification
    await creerNotification(
      'Livraison',
      '📦 Nouvelle livraison',
      `Livraison ${numero} vers ${succursale.nom} (${totalUSD.toFixed(2)} USD)`,
      { livraisonId: livraison._id, numero, nom: succursale.nom, montant: totalUSD }
    );

    res.status(201).json(livraison);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const supprimerLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findByIdAndDelete(req.params.id);
    if (!livraison) return res.status(404).json({ message: 'Livraison introuvable' });
    res.json({ message: 'Livraison supprimée', livraison });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};