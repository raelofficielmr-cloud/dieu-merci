import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Role = 'Proprietaire' | 'Informaticien';

interface MenuItem {
  name: string;
  path: string;
  icone: string;
  roles: Role[];
}

const menuItems: MenuItem[] = [
  { name: 'Tableau de bord', path: '/', icone: '📊', roles: ['Proprietaire', 'Informaticien'] },
  { name: 'Gestion Stock', path: '/stock', icone: '📦', roles: ['Proprietaire', 'Informaticien'] },
  { name: 'Structure de Prix', path: '/structure-prix', icone: '💰', roles: ['Proprietaire'] },
  { name: 'Suivi Crédit', path: '/suivi-credit', icone: '🛒', roles: ['Informaticien'] },
  { name: 'Historiques', path: '/historique', icone: '📜', roles: ['Proprietaire', 'Informaticien'] },
  { name: 'Succursales', path: '/succursales', icone: '🏪', roles: ['Proprietaire'] },
  { name: 'Mode Sombre', path: '/mode-sombre', icone: '🌙', roles: ['Proprietaire', 'Informaticien'] },
  { name: 'Paramètres', path: '/parametres', icone: '⚙️', roles: ['Proprietaire'] },
];

const menuMobile: MenuItem[] = [
  { name: 'Tableau', path: '/', icone: '📊', roles: ['Proprietaire', 'Informaticien'] },
  { name: 'Stock', path: '/stock', icone: '📦', roles: ['Proprietaire', 'Informaticien'] },
  { name: 'Crédit', path: '/suivi-credit', icone: '🛒', roles: ['Informaticien'] },
  { name: 'Historique', path: '/historique', icone: '📜', roles: ['Proprietaire', 'Informaticien'] },
  { name: 'Prix', path: '/structure-prix', icone: '💰', roles: ['Proprietaire'] },
  { name: 'Succursales', path: '/succursales', icone: '🏪', roles: ['Proprietaire'] },
];

export default function Sidebar() {
  const location = useLocation();
  const { role } = useAuth();

  const menusAutorises = menuItems.filter((m) => role && m.roles.includes(role));
  const menusMobileAutorises = menuMobile.filter((m) => role && m.roles.includes(role));

  return (
    <>
      {/* SIDEBAR ORDINATEUR */}
      <aside className="hidden md:flex bg-white dark:bg-gray-800 w-64 min-h-screen border-r border-gray-200 dark:border-gray-700 flex-col transition-colors flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <img
            src="/logoets.png"
            alt="Dieu Merci"
            className="h-24 w-auto mx-auto object-contain"
          />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menusAutorises.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{item.icone}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              if (confirm('Voulez-vous vous déconnecter ?')) {
                localStorage.removeItem('dieumerci_role');
                window.location.href = '/login';
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
          >
            <span className="text-lg">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* BARRE DU BAS MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 transition-colors">
        <div className="flex justify-around items-center py-1 overflow-x-auto">
          {menusMobileAutorises.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg flex-shrink-0 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <span className="text-xl">{item.icone}</span>
                <span className="text-[9px] font-medium text-center leading-tight whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}