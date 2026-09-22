import api from './api';

export const iaService = {
  chat: async (message: string): Promise<string> => {
    const response = await api.post('/ia/chat', { message });
    return response.data.reponse;
  },
};