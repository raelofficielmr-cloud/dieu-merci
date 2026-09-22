import Versement from '../models/Versement.js';
import Succursale from '../models/Succursale.js';
import Historique from '../models/Historique.js';
import { creerNotification } from './notificationController.js';

export const getVersements = async (req, res) => {
  try {
    const versements = await Versement.find().sort({ date: -1 });
    res.json(versements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const creerVersement = async (req, res) => {
  try {
    const { succursaleId, date, verseUSD, verseCDF, taux } = req.body;

    const succursale = await Succursale.findById(succursaleId);
    if (!succursale) return res.status(404).json({ message: 'Succursale introuvable' });

    const montantUSD = Number(verseUSD) + Number(verseCDF) / Number(taux);
    const nouveauReste = succursale.detteActuelle - montantUSD;

    const versement = await Versement.create({
      succursaleId,
      succursaleNom: succursale.nom,
      date,
      verseUSD: Number(verseUSD),
      verseCDF: Number(verseCDF),
      taux: Number(taux),
      reste: nouveauReste,
    });

    succursale.detteActuelle = nouveauReste;
    await succursale.save();

    await Historique.create({
      date,
      type: 'Versement',
      succursale: succursale.nom,
      montant: montantUSD,
      utilisateur: 'Proprietaire',
    });

    // Notification
    await creerNotification(
      'Versement',
      '💰 Nouveau versement',
      `${succursale.nom} a versé ${montantUSD.toFixed(2)} USD`,
      { succursaleId, nom: succursale.nom, montant: montantUSD }
    );

    res.status(201).json(versement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const supprimerVersement = async (req, res) => {
  try {
    const versement = await Versement.findByIdAndDelete(req.params.id);
    if (!versement) return res.status(404).json({ message: 'Versement introuvable' });
    res.json({ message: 'Versement supprimé', versement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};