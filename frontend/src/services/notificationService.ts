import api from './api';

export interface Notification {
  _id: string;
  destinataire: 'Proprietaire' | 'Informaticien';
  type: 'StockBas' | 'Livraison' | 'Versement' | 'NouveauProduit' | 'Suppression' | 'MotDePasse' | 'NouvelleSuccursale';
  titre: string;
  message: string;
  lu: boolean;
  data?: any;
  createdAt: string;
}

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getNonLues: async (): Promise<number> => {
    const response = await api.get('/notifications/non-lues');
    return response.data.count;
  },

  marquerLue: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/lu`);
  },

  marquerToutesLues: async (): Promise<void> => {
    await api.put('/notifications/toutes-lues');
  },

  supprimer: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};