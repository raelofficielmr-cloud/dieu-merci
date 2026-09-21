import Produit from '../models/Produit.js';
import Historique from '../models/Historique.js';

// Obtenir tous les produits
export const getProduits = async (req, res) => {
  try {
    const produits = await Produit.find().sort({ createdAt: -1 });
    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un produit par ID
export const getProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un produit
export const creerProduit = async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Modifier un produit
export const modifierProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!produit) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un produit
export const supprimerProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json({ message: 'Produit supprimé', produit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approvisionner
export const approvisionner = async (req, res) => {
  try {
    const { quantite, unite } = req.body;
    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    produit.quantite += Number(quantite);
    if (unite) produit.unite = unite;

    await produit.save();

    // Enregistrer dans l'historique
    await Historique.create({
      date: new Date(),
      type: 'Approvisionnement',
      produit: produit.nom,
      quantite: Number(quantite),
      unite: unite || produit.unite,
      utilisateur: 'Informaticien',
    });

    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sortie de stock
export const sortieStock = async (req, res) => {
  try {
    const { quantite, unite } = req.body;
    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    produit.quantite = Math.max(0, produit.quantite - Number(quantite));
    if (unite) produit.unite = unite;

    await produit.save();

    // Enregistrer dans l'historique
    await Historique.create({
      date: new Date(),
      type: 'Sortie',
      produit: produit.nom,
      quantite: Number(quantite),
      unite: unite || produit.unite,
      utilisateur: 'Informaticien',
    });

    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};