import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';

const genererToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const login = async (req, res) => {
  try {
    const { motDePasse } = req.body;

    if (!motDePasse) {
      return res.status(400).json({ message: 'Mot de passe requis' });
    }

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

// Obtenir la liste des utilisateurs (pour Papa)
export const getUtilisateurs = async (req, res) => {
  try {
    if (req.utilisateur.role !== 'Proprietaire') {
      return res.status(403).json({ message: 'Réservé au propriétaire' });
    }
    const utilisateurs = await Utilisateur.find().select('-motDePasse');
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Changer le mot de passe (soi-même OU un autre si on est propriétaire)
export const changerMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse, cibleId } = req.body;

    if (!nouveauMotDePasse) {
      return res.status(400).json({ message: 'Le nouveau mot de passe est requis' });
    }

    if (nouveauMotDePasse.length < 4) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit faire au moins 4 caractères',
      });
    }

    // Récupérer l'utilisateur connecté
    const utilisateurConnecte = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateurConnecte) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Déterminer la cible
    let utilisateurCible = utilisateurConnecte;
    let changementAutreUtilisateur = false;

    if (cibleId && cibleId !== req.utilisateur.id) {
      // On change le mot de passe d'un AUTRE utilisateur
      if (utilisateurConnecte.role !== 'Proprietaire') {
        return res.status(403).json({
          message: 'Seul le propriétaire peut modifier le mot de passe des autres',
        });
      }
      utilisateurCible = await Utilisateur.findById(cibleId);
      if (!utilisateurCible) {
        return res.status(404).json({ message: 'Utilisateur cible introuvable' });
      }
      changementAutreUtilisateur = true;
    }

    // Si on change SON PROPRE mot de passe → vérifier l'ancien
    if (!changementAutreUtilisateur) {
      if (!ancienMotDePasse) {
        return res.status(400).json({ message: 'Ancien mot de passe requis' });
      }
      const correspond = await utilisateurCible.comparerMotDePasse(ancienMotDePasse);
      if (!correspond) {
        return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
      }
    }

    // Mettre à jour
    utilisateurCible.motDePasse = nouveauMotDePasse;
    await utilisateurCible.save();

    res.json({
      message: changementAutreUtilisateur
        ? `✅ Mot de passe de ${utilisateurCible.nom} modifié avec succès`
        : '✅ Votre mot de passe a été modifié avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};