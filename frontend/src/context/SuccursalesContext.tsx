import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { succursalesInitiales, type Succursale } from '../data/succursales';

interface SuccursalesContextType {
  succursales: Succursale[];
  setSuccursales: (s: Succursale[]) => void;
  ajouterSuccursale: (s: Succursale) => void;
  supprimerSuccursale: (id: number) => void;
  mettreAJourSuccursale: (id: number, modifs: Partial<Succursale>) => void;
}

const SuccursalesContext = createContext<SuccursalesContextType | undefined>(undefined);

const CLE_SUCCURSALES = 'dieumerci_succursales';

export function SuccursalesProvider({ children }: { children: ReactNode }) {
  const [succursales, setSuccursalesState] = useState<Succursale[]>(() => {
    const sauvegarde = localStorage.getItem(CLE_SUCCURSALES);
    if (sauvegarde) {
      try {
        return JSON.parse(sauvegarde);
      } catch (e) {
        return succursalesInitiales;
      }
    }
    return succursalesInitiales;
  });

  useEffect(() => {
    localStorage.setItem(CLE_SUCCURSALES, JSON.stringify(succursales));
  }, [succursales]);

  const setSuccursales = (s: Succursale[]) => setSuccursalesState(s);

  const ajouterSuccursale = (s: Succursale) => {
    setSuccursalesState([...succursales, s]);
  };

  const supprimerSuccursale = (id: number) => {
    setSuccursalesState(succursales.filter((s) => s.id !== id));
  };

  const mettreAJourSuccursale = (id: number, modifs: Partial<Succursale>) => {
    setSuccursalesState(
      succursales.map((s) => (s.id === id ? { ...s, ...modifs } : s))
    );
  };

  return (
    <SuccursalesContext.Provider
      value={{
        succursales,
        setSuccursales,
        ajouterSuccursale,
        supprimerSuccursale,
        mettreAJourSuccursale,
      }}
    >
      {children}
    </SuccursalesContext.Provider>
  );
}

export function useSuccursales() {
  const context = useContext(SuccursalesContext);
  if (!context) throw new Error('useSuccursales doit être dans SuccursalesProvider');
  return context;
}