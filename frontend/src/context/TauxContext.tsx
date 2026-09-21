import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { parametreService } from '../services/parametreService';

interface TauxContextType {
  taux: number;
  setTaux: (valeur: number) => Promise<void>;
  chargerTaux: () => Promise<void>;
}

const TauxContext = createContext<TauxContextType | undefined>(undefined);

const TAUX_DEFAUT = 2350;

export function TauxProvider({ children }: { children: ReactNode }) {
  const [taux, setTauxState] = useState<number>(TAUX_DEFAUT);

  const chargerTaux = async () => {
    // ⚠️ Ne charger QUE si connecté
    const token = localStorage.getItem('dieumerci_token');
    if (!token) return;

    try {
      const params = await parametreService.get();
      setTauxState(params.tauxDuJour);
    } catch (error) {
      console.warn('Impossible de charger le taux :', error);
    }
  };

  useEffect(() => {
    chargerTaux();
  }, []);

  const setTaux = async (valeur: number) => {
    setTauxState(valeur);
    try {
      await parametreService.update({ tauxDuJour: valeur });
    } catch (error) {
      console.error('Erreur sauvegarde taux :', error);
    }
  };

  return (
    <TauxContext.Provider value={{ taux, setTaux, chargerTaux }}>
      {children}
    </TauxContext.Provider>
  );
}

export function useTaux() {
  const context = useContext(TauxContext);
  if (!context) throw new Error('useTaux doit être dans TauxProvider');
  return context;
}