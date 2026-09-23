import express from 'express';
import {
  login,
  creerUtilisateur,
  getMe,
  getUtilisateurs,
  changerMotDePasse,
  definirQuestionSecurite,
  getMaQuestionSecurite,
  getQuestionSecuriteParRole,
  reinitialiserMotDePasse,
} from '../controllers/authController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/login', login);
router.post('/register', creerUtilisateur);
router.get('/question-securite/:role', getQuestionSecuriteParRole);
router.post('/reinitialiser-mot-de-passe', reinitialiserMotDePasse);

// Routes protégées (connecté)
router.get('/me', proteger, getMe);
router.get('/utilisateurs', proteger, getUtilisateurs);
router.put('/changer-mot-de-passe', proteger, changerMotDePasse);
router.put('/question-securite', proteger, definirQuestionSecurite);
router.get('/ma-question-securite', proteger, getMaQuestionSecurite);

export default router;