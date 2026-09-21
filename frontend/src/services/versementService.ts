import api from './api';

export interface Versement {
  _id: string;
  succursaleId: string;
  succursaleNom: string;
  date: string;
  verseUSD: number;
  verseCDF: number;
  taux: number;
  reste: number;
}

export const versementService = {
  getAll: async (): Promise<Versement[]> => {
    const response = await api.get('/versements');
    return response.data;
  },
  create: async (versement: Partial<Versement>): Promise<Versement> => {
    const response = await api.post('/versements', versement);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/versements/${id}`);
  },
};