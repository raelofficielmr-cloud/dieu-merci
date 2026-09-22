import express from 'express';
import {
  getNotifications,
  getNombreNonLues,
  marquerLue,
  marquerToutesLues,
  supprimerNotification,
} from '../controllers/notificationController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.get('/', proteger, getNotifications);
router.get('/non-lues', proteger, getNombreNonLues);
router.put('/:id/lu', proteger, marquerLue);
router.put('/toutes-lues', proteger, marquerToutesLues);
router.delete('/:id', proteger, supprimerNotification);

export default router;