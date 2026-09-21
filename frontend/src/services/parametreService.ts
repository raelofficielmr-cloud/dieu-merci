import api from './api';

export interface Parametre {
  _id: string;
  tauxDuJour: number;
  nomEntreprise: string;
  adresse: string;
  telephone: string;
}

export const parametreService = {
  get: async (): Promise<Parametre> => {
    const response = await api.get('/parametres');
    return response.data;
  },
  update: async (parametres: Partial<Parametre>): Promise<Parametre> => {
    const response = await api.put('/parametres', parametres);
    return response.data;
  },
};