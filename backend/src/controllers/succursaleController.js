import Succursale from '../models/Succursale.js';
import Versement from '../models/Versement.js';
import { creerNotification } from './notificationController.js';

export const getSuccursales = async (req, res) => {
  try {
    const succursales = await Succursale.find().sort({ createdAt: -1 });
    res.json(succursales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findById(req.params.id);
    if (!succursale) return res.status(404).json({ message: 'Succursale introuvable' });
    res.json(succursale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const creerSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.create(req.body);

    // Notification
    await creerNotification(
      'NouvelleSuccursale',
      '🏪 Nouvelle succursale',
      `La succursale ${succursale.nom} a été créée`,
      { succursaleId: succursale._id, nom: succursale.nom }
    );

    res.status(201).json(succursale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const modifierSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!succursale) return res.status(404).json({ message: 'Succursale introuvable' });
    res.json(succursale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const supprimerSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findByIdAndDelete(req.params.id);
    if (!succursale) return res.status(404).json({ message: 'Succursale introuvable' });
    res.json({ message: 'Succursale supprimée', succursale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVersementsSuccursale = async (req, res) => {
  try {
    const versements = await Versement.find({ succursaleId: req.params.id })
      .sort({ date: -1 })
      .limit(3);
    res.json(versements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};