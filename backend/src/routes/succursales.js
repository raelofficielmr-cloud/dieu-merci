import express from 'express';
import {
  getSuccursales,
  getSuccursale,
  creerSuccursale,
  modifierSuccursale,
  supprimerSuccursale,
  getVersementsSuccursale,
} from '../controllers/succursaleController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.get('/', proteger, getSuccursales);
router.get('/:id', proteger, getSuccursale);
router.post('/', proteger, creerSuccursale);
router.put('/:id', proteger, modifierSuccursale);
router.delete('/:id', proteger, supprimerSuccursale);
router.get('/:id/versements', proteger, getVersementsSuccursale);

export default router;