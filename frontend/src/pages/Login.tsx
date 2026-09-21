import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!motDePasse) {
      setErreur('Entrez le mot de passe');
      return;
    }

    const ok = await connexion(motDePasse);
if (ok) {
  navigate('/');
} else {
  setErreur('Mot de passe incorrect');

    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header avec logo */}
        <div className="bg-white dark:bg-gray-800 p-8 text-center border-b border-gray-200 dark:border-gray-700">
          <img
            src="/logodieumerci.png"
            alt="Dieu Merci"
            className="h-28 w-auto mx-auto object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">
            Dieu Merci
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Système de Gestion
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">
            Connexion
          </h2>

          {erreur && (
            <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-3 rounded text-sm">
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
        </form>
      </div>
    </div>
  );
}