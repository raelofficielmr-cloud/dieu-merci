import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

import authRoutes from './routes/auth.js';
import produitRoutes from './routes/produits.js';
import succursaleRoutes from './routes/succursales.js';
import versementRoutes from './routes/versements.js';
import livraisonRoutes from './routes/livraisons.js';
import parametreRoutes from './routes/parametres.js';
import historiqueRoutes from './routes/historique.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: '✅ API Dieu Merci fonctionne !' });
});

app.use('/api/auth', authRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/succursales', succursaleRoutes);
app.use('/api/versements', versementRoutes);
app.use('/api/livraisons', livraisonRoutes);
app.use('/api/parametres', parametreRoutes);
app.use('/api/historique', historiqueRoutes);

// Démarrage
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
});