import express from 'express';
import {
  getProduits,
  getProduit,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  approvisionner,
  sortieStock,
} from '../controllers/produitController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.get('/', proteger, getProduits);
router.get('/:id', proteger, getProduit);
router.post('/', proteger, creerProduit);
router.put('/:id', proteger, modifierProduit);
router.delete('/:id', proteger, supprimerProduit);
router.post('/:id/approvisionner', proteger, approvisionner);
router.post('/:id/sortie', proteger, sortieStock);

export default router;