import api from './api';

export interface User {
  _id: string;
  nom: string;
  role: 'Proprietaire' | 'Informaticien';
  token: string;
}

export const authService = {
  login: async (motDePasse: string): Promise<User> => {
    const response = await api.post('/auth/login', { motDePasse });
    return response.data;
  },

  changerMotDePasse: async (ancienMotDePasse: string, nouveauMotDePasse: string): Promise<void> => {
    await api.put('/auth/changer-mot-de-passe', { ancienMotDePasse, nouveauMotDePasse });
  },
};