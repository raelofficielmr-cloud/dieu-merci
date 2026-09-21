import Parametre from '../models/Parametre.js';

// Obtenir les paramètres (créer si inexistant)
export const getParametres = async (req, res) => {
  try {
    let parametres = await Parametre.findOne();
    if (!parametres) {
      parametres = await Parametre.create({});
    }
    res.json(parametres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour les paramètres
export const modifierParametres = async (req, res) => {
  try {
    let parametres = await Parametre.findOne();
    if (!parametres) {
      parametres = await Parametre.create(req.body);
    } else {
      Object.assign(parametres, req.body);
      await parametres.save();
    }
    res.json(parametres);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};