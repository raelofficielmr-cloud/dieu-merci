import api from './api';

export interface Produit {
  _id: string;
  nom: string;
  description: string;
  poids: number;
  quantite: number;
  unite: string;
  sousUnite?: string;
  prixUnitaire: number;
  prixVenteLot: number;
  prixAchat: number;
  marge: number;
  piecesParLot: number;
  lotGros: number;
  categorie: string;
  seuilAlerte: number;
}

export const produitService = {
  getAll: async (): Promise<Produit[]> => {
    const response = await api.get('/produits');
    return response.data;
  },
  create: async (produit: Partial<Produit>): Promise<Produit> => {
    const response = await api.post('/produits', produit);
    return response.data;
  },
  update: async (id: string, produit: Partial<Produit>): Promise<Produit> => {
    const response = await api.put(`/produits/${id}`, produit);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/produits/${id}`);
  },
  approvisionner: async (id: string, quantite: number, unite: string): Promise<Produit> => {
    const response = await api.post(`/produits/${id}/approvisionner`, { quantite, unite });
    return response.data;
  },
};