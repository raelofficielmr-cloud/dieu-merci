import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';
import { creerNotification } from './notificationController.js';

const genererToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ========== LOGIN ==========
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

// ========== CRÉER UTILISATEUR ==========
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

// ========== GET ME ==========
export const getMe = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id).select('-motDePasse -reponseSecurite');
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== LISTE UTILISATEURS ==========
export const getUtilisateurs = async (req, res) => {
  try {
    if (req.utilisateur.role !== 'Proprietaire') {
      return res.status(403).json({ message: 'Réservé au propriétaire' });
    }
    const utilisateurs = await Utilisateur.find().select('-motDePasse -reponseSecurite');
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== CHANGER MOT DE PASSE ==========
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

    const utilisateurConnecte = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateurConnecte) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    let utilisateurCible = utilisateurConnecte;
    let changementAutreUtilisateur = false;

    if (cibleId && cibleId !== req.utilisateur.id) {
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

    if (!changementAutreUtilisateur) {
      if (!ancienMotDePasse) {
        return res.status(400).json({ message: 'Ancien mot de passe requis' });
      }
      const correspond = await utilisateurCible.comparerMotDePasse(ancienMotDePasse);
      if (!correspond) {
        return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
      }
    }

    utilisateurCible.motDePasse = nouveauMotDePasse;
    await utilisateurCible.save();

    await creerNotification(
      'MotDePasse',
      '🔐 Mot de passe changé',
      changementAutreUtilisateur
        ? `Le mot de passe de ${utilisateurCible.nom} a été modifié`
        : `Votre mot de passe a été modifié`,
      { utilisateurId: utilisateurCible._id, nom: utilisateurCible.nom }
    );

    res.json({
      message: changementAutreUtilisateur
        ? `✅ Mot de passe de ${utilisateurCible.nom} modifié avec succès`
        : '✅ Votre mot de passe a été modifié avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== DÉFINIR QUESTION DE SÉCURITÉ ==========
export const definirQuestionSecurite = async (req, res) => {
  try {
    const { questionSecurite, reponseSecurite, motDePasse } = req.body;

    if (!questionSecurite || !reponseSecurite || !motDePasse) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const utilisateur = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Vérifier le mot de passe actuel
    const correspond = await utilisateur.comparerMotDePasse(motDePasse);
    if (!correspond) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    utilisateur.questionSecurite = questionSecurite;
    utilisateur.reponseSecurite = reponseSecurite;
    await utilisateur.save();

    res.json({ message: '✅ Question de sécurité enregistrée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== OBTENIR LA QUESTION DE SÉCURITÉ (pour un rôle) ==========
export const getQuestionSecurite = async (req, res) => {
  try {
    const { role } = req.params;

    if (!role || !['Proprietaire', 'Informaticien'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const utilisateur = await Utilisateur.findOne({ role, actif: true }).select('questionSecurite nom');

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (!utilisateur.questionSecurite) {
      return res.status(400).json({
        message: 'Aucune question de sécurité définie pour ce compte',
      });
    }

    res.json({
      nom: utilisateur.nom,
      questionSecurite: utilisateur.questionSecurite,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== RÉINITIALISER MOT DE PASSE (avec question) ==========
export const reinitialiserMotDePasse = async (req, res) => {
  try {
    const { role, reponseSecurite, nouveauMotDePasse } = req.body;

    if (!role || !reponseSecurite || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (nouveauMotDePasse.length < 4) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit faire au moins 4 caractères',
      });
    }

    const utilisateur = await Utilisateur.findOne({ role, actif: true });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (!utilisateur.questionSecurite) {
      return res.status(400).json({
        message: 'Aucune question de sécurité définie pour ce compte',
      });
    }

    const correspond = await utilisateur.comparerReponse(reponseSecurite);
    if (!correspond) {
      return res.status(401).json({ message: 'Réponse incorrecte' });
    }

    utilisateur.motDePasse = nouveauMotDePasse;
    await utilisateur.save();

    await creerNotification(
      'MotDePasse',
      '🔐 Mot de passe réinitialisé',
      `Le mot de passe de ${utilisateur.nom} a été réinitialisé via question de sécurité`,
      { utilisateurId: utilisateur._id, nom: utilisateur.nom }
    );

    res.json({ message: '✅ Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};