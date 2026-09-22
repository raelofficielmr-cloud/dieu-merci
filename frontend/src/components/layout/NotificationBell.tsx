import { useState, useEffect, useRef } from 'react';
import { notificationService, type Notification } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const ICONES: Record<string, string> = {
  StockBas: '⚠️',
  Approvisionnement: '➕',
  Sortie: '📤',
  Livraison: '📦',
  Versement: '💰',
  NouveauProduit: '🆕',
  Suppression: '🗑️',
  MotDePasse: '🔐',
  NouvelleSuccursale: '🏪',
};

const COULEURS: Record<string, string> = {
  StockBas: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  Approvisionnement: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  Sortie: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  Livraison: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  Versement: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  NouveauProduit: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
  Suppression: 'border-red-600 bg-red-50 dark:bg-red-900/20',
  MotDePasse: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20',
  NouvelleSuccursale: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
};

export default function NotificationBell() {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const panneauRef = useRef<HTMLDivElement>(null);

  const estPapa = role === 'Proprietaire';

  const charger = async () => {
    if (!estPapa) return;
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.getNonLues(),
      ]);
      setNotifications(notifs);
      setNonLues(count);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!estPapa) return;
    charger();
    const interval = setInterval(charger, 30000);
    return () => clearInterval(interval);
  }, [estPapa]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panneauRef.current && !panneauRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    if (ouvert) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ouvert]);

  if (!estPapa) return null;

  const marquerLue = async (id: string) => {
    try {
      await notificationService.marquerLue(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, lu: true } : n))
      );
      setNonLues(Math.max(0, nonLues - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const marquerToutesLues = async () => {
    try {
      await notificationService.marquerToutesLues();
      setNotifications(notifications.map((n) => ({ ...n, lu: true })));
      setNonLues(0);
    } catch (error) {
      console.error(error);
    }
  };

  const supprimer = async (id: string, lu: boolean) => {
    try {
      await notificationService.supprimer(id);
      setNotifications(notifications.filter((n) => n._id !== id));
      if (!lu) setNonLues(Math.max(0, nonLues - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const formaterDate = (date: string) => {
    const d = new Date(date);
    const maintenant = new Date();
    const diff = Math.floor((maintenant.getTime() - d.getTime()) / 1000);

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative" ref={panneauRef}>
      <button
        onClick={() => setOuvert(!ouvert)}
        className="relative p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-lg md:text-xl"
        title="Notifications"
      >
        🔔
        {nonLues > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {nonLues > 99 ? '99+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 top-12 w-[90vw] max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm md:text-base">
              🔔 Notifications {nonLues > 0 && `(${nonLues})`}
            </h3>
            {nonLues > 0 && (
              <button
                onClick={marquerToutesLues}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">
                Aucune notification
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 flex gap-3 ${
                    !n.lu ? COULEURS[n.type] : 'opacity-60'
                  }`}
                >
                  <div className="text-2xl flex-shrink-0">{ICONES[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm text-gray-800 dark:text-white ${!n.lu ? 'font-bold' : 'font-normal'}`}>
                        {n.titre}
                      </p>
                      {!n.lu && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">
                        {formaterDate(n.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        {!n.lu && (
                          <button
                            onClick={() => marquerLue(n._id)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={() => supprimer(n._id, n.lu)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}