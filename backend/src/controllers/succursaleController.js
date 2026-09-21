import Succursale from '../models/Succursale.js';
import Versement from '../models/Versement.js';

// Obtenir toutes les succursales
export const getSuccursales = async (req, res) => {
  try {
    const succursales = await Succursale.find().sort({ createdAt: -1 });
    res.json(succursales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une succursale par ID
export const getSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findById(req.params.id);
    if (!succursale) {
      return res.status(404).json({ message: 'Succursale introuvable' });
    }
    res.json(succursale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une succursale
export const creerSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.create(req.body);
    res.status(201).json(succursale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Modifier une succursale
export const modifierSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!succursale) {
      return res.status(404).json({ message: 'Succursale introuvable' });
    }
    res.json(succursale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une succursale
export const supprimerSuccursale = async (req, res) => {
  try {
    const succursale = await Succursale.findByIdAndDelete(req.params.id);
    if (!succursale) {
      return res.status(404).json({ message: 'Succursale introuvable' });
    }
    res.json({ message: 'Succursale supprimée', succursale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les versements d'une succursale
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