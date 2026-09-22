import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

type Role = 'Proprietaire' | 'Informaticien';

interface AuthContextType {
  role: Role | null;
  nom: string;
  chargement: boolean;
  connexion: (motDePasse: string) => Promise<boolean>;
  deconnexion: () => void;
  estProprietaire: () => boolean;
  estInformaticien: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [nom, setNom] = useState<string>('');
  const [chargement, setChargement] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('dieumerci_token');
    const userStr = localStorage.getItem('dieumerci_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setRole(user.role);
        setNom(user.nom);
      } catch (e) {
        localStorage.removeItem('dieumerci_token');
        localStorage.removeItem('dieumerci_user');
      }
    }
    setChargement(false);
  }, []);

  const connexion = async (motDePasse: string): Promise<boolean> => {
    try {
      const user = await authService.login(motDePasse);
      setRole(user.role);
      setNom(user.nom);
      localStorage.setItem('dieumerci_token', user.token);
      localStorage.setItem('dieumerci_user', JSON.stringify({ nom: user.nom, role: user.role }));
      return true;
    } catch (error) {
      console.error('Erreur login:', error);
      return false;
    }
  };

  const deconnexion = () => {
    setRole(null);
    setNom('');
    localStorage.removeItem('dieumerci_token');
    localStorage.removeItem('dieumerci_user');
  };

  const estProprietaire = () => role === 'Proprietaire';
  const estInformaticien = () => role === 'Informaticien';

  return (
    <AuthContext.Provider
      value={{ role, nom, chargement, connexion, deconnexion, estProprietaire, estInformaticien }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être dans AuthProvider');
  return context;
}