import Historique from '../models/Historique.js';

// Obtenir tout l'historique
export const getHistorique = async (req, res) => {
  try {
    const historique = await Historique.find().sort({ date: -1 });
    res.json(historique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une entrée d'historique
export const creerHistorique = async (req, res) => {
  try {
    const entree = await Historique.create(req.body);
    res.status(201).json(entree);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une entrée
export const supprimerHistorique = async (req, res) => {
  try {
    const entree = await Historique.findByIdAndDelete(req.params.id);
    if (!entree) {
      return res.status(404).json({ message: 'Entrée introuvable' });
    }
    res.json({ message: 'Entrée supprimée', entree });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};