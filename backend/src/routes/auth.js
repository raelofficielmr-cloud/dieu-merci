import express from 'express';
import { login, creerUtilisateur, getMe } from '../controllers/authController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', creerUtilisateur);  // À utiliser une seule fois
router.get('/me', proteger, getMe);

export default router;