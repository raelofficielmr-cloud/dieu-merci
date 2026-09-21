import express from 'express';
import {
  getVersements,
  creerVersement,
  supprimerVersement,
} from '../controllers/versementController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.get('/', proteger, getVersements);
router.post('/', proteger, creerVersement);
router.delete('/:id', proteger, supprimerVersement);

export default router;