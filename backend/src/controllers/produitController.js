import Produit from '../models/Produit.js';
import Historique from '../models/Historique.js';
import { creerNotification } from './notificationController.js';

export const getProduits = async (req, res) => {
  try {
    const produits = await Produit.find().sort({ createdAt: -1 });
    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const creerProduit = async (req, res) => {
  try {
    const produit = await Produit.create(req.body);

    await creerNotification(
      'NouveauProduit',
      '➕ Nouveau produit',
      `${produit.nom} a été ajouté au catalogue`,
      { produitId: produit._id, nom: produit.nom }
    );

    res.status(201).json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const modifierProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const supprimerProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });

    await creerNotification(
      'Suppression',
      '🗑️ Produit supprimé',
      `${produit.nom} a été supprimé du catalogue`,
      { nom: produit.nom }
    );

    res.json({ message: 'Produit supprimé', produit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approvisionner = async (req, res) => {
  try {
    const { quantite, unite } = req.body;
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });

    const ancienneQuantite = produit.quantite;
    produit.quantite += Number(quantite);
    if (unite) produit.unite = unite;
    await produit.save();

    await Historique.create({
      date: new Date(),
      type: 'Approvisionnement',
      produit: produit.nom,
      quantite: Number(quantite),
      unite: unite || produit.unite,
      utilisateur: 'Informaticien',
    });

    await creerNotification(
      'Approvisionnement',
      '➕ Approvisionnement',
      `${produit.nom} : +${quantite} ${unite || produit.unite} (${ancienneQuantite} → ${produit.quantite})`,
      { produitId: produit._id, nom: produit.nom, quantite }
    );

    if (produit.quantite < produit.seuilAlerte) {
      await creerNotification(
        'StockBas',
        '⚠️ Stock bas',
        `${produit.nom} est en dessous du seuil (${produit.quantite}/${produit.seuilAlerte} ${produit.unite})`,
        { produitId: produit._id, nom: produit.nom, quantite: produit.quantite }
      );
    }

    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sortieStock = async (req, res) => {
  try {
    const { quantite, unite } = req.body;
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });

    const ancienneQuantite = produit.quantite;
    produit.quantite = Math.max(0, produit.quantite - Number(quantite));
    if (unite) produit.unite = unite;
    await produit.save();

    await Historique.create({
      date: new Date(),
      type: 'Sortie',
      produit: produit.nom,
      quantite: Number(quantite),
      unite: unite || produit.unite,
      utilisateur: 'Informaticien',
    });

    await creerNotification(
      'Sortie',
      '📤 Sortie de stock',
      `${produit.nom} : -${quantite} ${unite || produit.unite} (${ancienneQuantite} → ${produit.quantite})`,
      { produitId: produit._id, nom: produit.nom, quantite }
    );

    if (produit.quantite < produit.seuilAlerte) {
      await creerNotification(
        'StockBas',
        '⚠️ Stock bas',
        `${produit.nom} est en dessous du seuil (${produit.quantite}/${produit.seuilAlerte} ${produit.unite})`,
        { produitId: produit._id, nom: produit.nom, quantite: produit.quantite }
      );
    }

    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};