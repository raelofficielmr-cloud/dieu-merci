import express from 'express';
import {
  login,
  creerUtilisateur,
  getMe,
  getUtilisateurs,
  changerMotDePasse,
  definirQuestionSecurite,
  getQuestionSecurite,
  reinitialiserMotDePasse,
} from '../controllers/authController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', creerUtilisateur);
router.get('/me', proteger, getMe);
router.get('/utilisateurs', proteger, getUtilisateurs);
router.put('/changer-mot-de-passe', proteger, changerMotDePasse);
router.put('/question-securite', proteger, definirQuestionSecurite);
router.get('/question-securite/:role', getQuestionSecurite);
router.post('/reinitialiser-mot-de-passe', reinitialiserMotDePasse);

export default router;