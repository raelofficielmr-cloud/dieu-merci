// Taux du jour par défaut (modifiable dans Paramètres plus tard)
export const TAUX_DU_JOUR_DEFAUT = 2350;

// Lit le taux depuis localStorage (ou la valeur par défaut)
export const getTauxDuJour = (): number => {
  const sauvegarde = localStorage.getItem('dieumerci_taux');
  return sauvegarde ? Number(sauvegarde) : TAUX_DU_JOUR_DEFAUT;
};

// Sauvegarde le taux
export const setTauxDuJour = (valeur: number) => {
  localStorage.setItem('dieumerci_taux', valeur.toString());
};