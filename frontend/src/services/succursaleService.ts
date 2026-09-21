import api from './api';

export interface Succursale {
  _id: string;
  nom: string;
  adresse: string;
  telephone: string;
  detteActuelle: number;
  actif: boolean;
}

export const succursaleService = {
  getAll: async (): Promise<Succursale[]> => {
    const response = await api.get('/succursales');
    return response.data;
  },
  create: async (succursale: Partial<Succursale>): Promise<Succursale> => {
    const response = await api.post('/succursales', succursale);
    return response.data;
  },
  update: async (id: string, succursale: Partial<Succursale>): Promise<Succursale> => {
    const response = await api.put(`/succursales/${id}`, succursale);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/succursales/${id}`);
  },
};