import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';

export const proteger = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⚠️ Vérifier tokenVersion
    const utilisateur = await Utilisateur.findById(decoded.id);
    if (!utilisateur) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    if (utilisateur.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        message: 'Session expirée. Veuillez vous reconnecter.',
      });
    }

    req.utilisateur = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

export const estProprietaire = (req, res, next) => {
  if (req.utilisateur?.role !== 'Proprietaire') {
    return res.status(403).json({ message: 'Réservé au propriétaire' });
  }
  next();
};

export const estInformaticien = (req, res, next) => {
  if (req.utilisateur?.role !== 'Informaticien') {
    return res.status(403).json({ message: 'Réservé à l\'informaticien' });
  }
  next();
};