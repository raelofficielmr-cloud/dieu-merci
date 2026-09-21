import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';

// Générer un token JWT
const genererToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Login
export const login = async (req, res) => {
  try {
    const { motDePasse } = req.body;

    if (!motDePasse) {
      return res.status(400).json({ message: 'Mot de passe requis' });
    }

    // Chercher l'utilisateur par son mot de passe (on compare)
    const utilisateurs = await Utilisateur.find({ actif: true });

    let utilisateurTrouve = null;
    for (const u of utilisateurs) {
      const correspond = await u.comparerMotDePasse(motDePasse);
      if (correspond) {
        utilisateurTrouve = u;
        break;
      }
    }

    if (!utilisateurTrouve) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    res.json({
      _id: utilisateurTrouve._id,
      nom: utilisateurTrouve.nom,
      role: utilisateurTrouve.role,
      token: genererToken(utilisateurTrouve._id, utilisateurTrouve.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un utilisateur (à lancer une fois pour initialiser)
export const creerUtilisateur = async (req, res) => {
  try {
    const { nom, motDePasse, role } = req.body;

    if (!nom || !motDePasse || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const existe = await Utilisateur.findOne({ nom });
    if (existe) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const utilisateur = await Utilisateur.create({ nom, motDePasse, role });

    res.status(201).json({
      _id: utilisateur._id,
      nom: utilisateur.nom,
      role: utilisateur.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir l'utilisateur connecté
export const getMe = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id).select('-motDePasse');
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};