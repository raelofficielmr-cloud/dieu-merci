import express from 'express';
import {
  getLivraisons,
  creerLivraison,
  supprimerLivraison,
} from '../controllers/livraisonController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.get('/', proteger, getLivraisons);
router.post('/', proteger, creerLivraison);
router.delete('/:id', proteger, supprimerLivraison);

export default router;