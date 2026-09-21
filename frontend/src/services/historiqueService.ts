import api from './api';

export type TypeActivite = 'Livraison' | 'Approvisionnement' | 'Versement' | 'Sortie';

export interface Historique {
  _id: string;
  date: string;
  type: TypeActivite;
  succursale?: string;
  montant?: number;
  produit?: string;
  quantite?: number;
  unite?: string;
  utilisateur?: string;
}

export const historiqueService = {
  getAll: async (): Promise<Historique[]> => {
    const response = await api.get('/historique');
    return response.data;
  },
  create: async (entree: Partial<Historique>): Promise<Historique> => {
    const response = await api.post('/historique', entree);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/historique/${id}`);
  },
};