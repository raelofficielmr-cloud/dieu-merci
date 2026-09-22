import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [dejaInstalle, setDejaInstalle] = useState(false);
  const { connexion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDejaInstalle(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    if (!motDePasse) return setErreur('Entrez le mot de passe');
    const ok = await connexion(motDePasse);
    if (ok) navigate('/');
    else setErreur('Mot de passe incorrect');
  };

  const installerPWA = async () => {
    if (!installPrompt) {
      alert(
        'Pour installer l\'application :\n\n' +
          '1. Ouvrez le menu de votre navigateur (⋮)\n' +
          '2. Cliquez sur "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"'
      );
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!dejaInstalle && (
          <button
            onClick={installerPWA}
            className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            📲 Installer l'application
          </button>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full overflow-hidden">
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 text-center border-b border-gray-200 dark:border-gray-700">
            <img
              src="/logodieumerci.png"
              alt="Dieu Merci"
              className="h-24 w-24 md:h-28 md:w-28 mx-auto object-contain"
            />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-4">
              Dieu Merci
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Système de Gestion
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white text-center mb-4">
              Connexion
            </h2>

            {erreur && (
              <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 text-red-700 dark:text-red-300 p-3 rounded text-sm">
                ⚠️ {erreur}
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Mot de passe
              </label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                placeholder="••••"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
            >
              Se connecter
            </button>

            <div className="text-center">
              <Link
                to="/mot-de-passe-oublie"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Ets Dieu Merci - Version 1.0.0
        </p>
      </div>
    </div>
  );
}