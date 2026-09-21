import express from 'express';
import {
  getHistorique,
  creerHistorique,
  supprimerHistorique,
} from '../controllers/historiqueController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.get('/', proteger, getHistorique);
router.post('/', proteger, creerHistorique);
router.delete('/:id', proteger, supprimerHistorique);

export default router;