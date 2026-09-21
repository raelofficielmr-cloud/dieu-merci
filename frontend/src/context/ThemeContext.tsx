import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
  sombre: boolean;
  basculer: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [sombre, setSombre] = useState<boolean>(() => {
    const sauvegarde = localStorage.getItem('dieumerci_theme');
    return sauvegarde === 'sombre';
  });

  useEffect(() => {
    if (sombre) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dieumerci_theme', 'sombre');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dieumerci_theme', 'clair');
    }
  }, [sombre]);

  const basculer = () => setSombre(!sombre);

  return (
    <ThemeContext.Provider value={{ sombre, basculer }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme doit être dans ThemeProvider');
  return context;
}