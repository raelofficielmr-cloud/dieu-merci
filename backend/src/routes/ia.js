import express from 'express';
import { chat } from '../controllers/iaController.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', proteger, chat);

export default router;