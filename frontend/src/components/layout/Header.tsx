import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import IAChatbot from './IAChatbot';
const TITRES_PAGES: Record<string, { titre: string; sousTitre: string }> = {
  '/': { titre: 'Tableau de bord', sousTitre: 'Aperçu en temps réel de votre activité.' },
  '/stock': { titre: 'Gestion du Stock', sousTitre: 'Contrôle complet des marchandises.' },
  '/structure-prix': { titre: 'Structure de Prix', sousTitre: 'Imprimer facilement la structure de prix.' },
  '/suivi-credit': { titre: 'Suivi Crédit', sousTitre: 'Suivi des crédits clients.' },
  '/historique': { titre: 'Historiques', sousTitre: 'Suivi des livraisons, versements et approvisionnements.' },
  '/succursales': { titre: 'Mes Succursales', sousTitre: 'Gérer vos succursales et leurs dettes.' },
  '/mode-sombre': { titre: 'Mode Sombre', sousTitre: 'Basculez entre le thème clair et sombre.' },
  '/parametres': { titre: 'Paramètres', sousTitre: 'Configuration du système.' },
};

export default function Header() {
  const { sombre, basculer } = useTheme();
  const { estProprietaire } = useAuth();
  const proprietaire = estProprietaire();
  const location = useLocation();

  const page = TITRES_PAGES[location.pathname] || {
    titre: 'Dieu Merci',
    sousTitre: 'Système de gestion',
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 py-2 md:py-4 transition-colors">
      <div className="flex items-center justify-between gap-2 md:gap-3">
        <img
          src="/logodieumerci.png"
          alt="Dieu Merci"
          className="h-10 w-10 md:hidden object-contain flex-shrink-0"
        />

        <div className="min-w-0 flex-1">
          <h1 className="text-sm md:text-2xl font-bold text-gray-800 dark:text-white leading-tight truncate">
            {page.titre}
          </h1>
          <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 leading-tight truncate">
            {page.sousTitre}
          </p>
        </div>

        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1.5">
            <div className={`w-2 h-2 rounded-full ${proprietaire ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span className={`text-xs font-bold ${proprietaire ? 'text-gray-700 dark:text-gray-200' : 'text-blue-700 dark:text-blue-300'}`}>
              {proprietaire ? 'PROPRIÉTAIRE' : 'INFORMATICIEN'}
            </span>
          </div>

          <button
            onClick={basculer}
            className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-lg md:text-xl"
            title="Mode sombre"
          >
            {sombre ? '☀️' : '🌙'}
          </button>

          {proprietaire && (
  <Link
    to="/parametres"
    className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-lg md:text-xl"
    title="Paramètres"
  >
    ⚙️
  </Link>
)}

                    <NotificationBell />
        </div>
      </div>

      <IAChatbot />
    </header>
  )
}