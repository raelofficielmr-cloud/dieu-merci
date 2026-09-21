import express from 'express';
import {
  getParametres,
  modifierParametres,
} from '../controllers/parametreController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.get('/', proteger, getParametres);
router.put('/', proteger, modifierParametres);

export default router;