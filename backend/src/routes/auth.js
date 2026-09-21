import express from 'express';
import {
  login,
  creerUtilisateur,
  getMe,
  changerMotDePasse,
} from '../controllers/authController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', creerUtilisateur);
router.get('/me', proteger, getMe);
router.put('/changer-mot-de-passe', proteger, changerMotDePasse);

export default router;