import api from './api';

export interface User {
  _id: string;
  nom: string;
  role: 'Proprietaire' | 'Informaticien';
  token: string;
}

export interface UtilisateurListe {
  _id: string;
  nom: string;
  role: 'Proprietaire' | 'Informaticien';
  actif: boolean;
}

export const authService = {
  login: async (motDePasse: string): Promise<User> => {
    const response = await api.post('/auth/login', { motDePasse });
    return response.data;
  },

  getUtilisateurs: async (): Promise<UtilisateurListe[]> => {
    const response = await api.get('/auth/utilisateurs');
    return response.data;
  },

  changerMotDePasse: async (
    ancienMotDePasse: string,
    nouveauMotDePasse: string,
    cibleId?: string
  ): Promise<void> => {
    await api.put('/auth/changer-mot-de-passe', {
      ancienMotDePasse,
      nouveauMotDePasse,
      cibleId,
    });
  },

  definirQuestionSecurite: async (
    questionSecurite: string,
    reponseSecurite: string,
    motDePasse: string
  ): Promise<void> => {
    await api.put('/auth/question-securite', {
      questionSecurite,
      reponseSecurite,
      motDePasse,
    });
  },

  getQuestionSecurite: async (
    role: 'Proprietaire' | 'Informaticien'
  ): Promise<{ nom: string; questionSecurite: string }> => {
    const response = await api.get(`/auth/question-securite/${role}`);
    return response.data;
  },

  reinitialiserMotDePasse: async (
    role: 'Proprietaire' | 'Informaticien',
    reponseSecurite: string,
    nouveauMotDePasse: string
  ): Promise<void> => {
    await api.post('/auth/reinitialiser-mot-de-passe', {
      role,
      reponseSecurite,
      nouveauMotDePasse,
    });
  },
};