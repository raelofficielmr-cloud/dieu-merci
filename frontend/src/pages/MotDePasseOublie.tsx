import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function MotDePasseOublie() {
  const [etape, setEtape] = useState<1 | 2>(1);
  const [question, setQuestion] = useState('');
  const [nom, setNom] = useState('');
  const [reponse, setReponse] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmationMdp, setConfirmationMdp] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  // ÉTAPE 1 → 2 : Charger la question du Propriétaire
  const chargerQuestion = async () => {
    setErreur('');
    setChargement(true);
    try {
      const data = await authService.getQuestionSecuriteParRole('Proprietaire');
      setQuestion(data.questionSecurite);
      setNom(data.nom);
      setEtape(2);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur';
      setErreur(msg);
    } finally {
      setChargement(false);
    }
  };

  // ÉTAPE 2 : Réinitialiser
  const reinitialiser = async () => {
    setErreur('');
    setMessage('');

    if (!reponse.trim()) return setErreur('Entrez votre réponse');
    if (nouveauMdp.length < 4)
      return setErreur('Le mot de passe doit faire au moins 4 caractères');
    if (nouveauMdp !== confirmationMdp)
      return setErreur('Les deux mots de passe ne correspondent pas');

    setChargement(true);
    try {
      await authService.reinitialiserMotDePasse('Proprietaire', reponse, nouveauMdp);
      setMessage('✅ Mot de passe réinitialisé ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur';
      setErreur(msg);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 p-6 text-center border-b border-gray-200 dark:border-gray-700">
            <img
              src="/logodieumerci.png"
              alt="Dieu Merci"
              className="h-20 w-20 mx-auto object-contain"
            />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mt-2">
              Mot de passe oublié
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Récupération du compte Propriétaire
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {erreur && (
              <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 text-red-700 dark:text-red-300 p-3 rounded text-sm">
                ⚠️ {erreur}
              </div>
            )}
            {message && (
              <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-600 text-green-700 dark:text-green-300 p-3 rounded text-sm">
                {message}
              </div>
            )}

            {/* ÉTAPE 1 : Continuer */}
            {etape === 1 && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">👑 Compte : Propriétaire (Papa)</p>
                  <p className="text-xs">
                    Vous allez répondre à votre question de sécurité.
                  </p>
                </div>
                <button
                  onClick={chargerQuestion}
                  disabled={chargement}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg"
                >
                  {chargement ? '⏳...' : 'Continuer'}
                </button>
              </>
            )}

            {/* ÉTAPE 2 : Répondre + nouveau MDP */}
            {etape === 2 && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Compte : <strong>{nom}</strong>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {question}
                  </label>
                  <input
                    type="text"
                    value={reponse}
                    onChange={(e) => setReponse(e.target.value)}
                    placeholder="Votre réponse..."
                    className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={nouveauMdp}
                    onChange={(e) => setNouveauMdp(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmer
                  </label>
                  <input
                    type="password"
                    value={confirmationMdp}
                    onChange={(e) => setConfirmationMdp(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  />
                </div>

                <button
                  onClick={reinitialiser}
                  disabled={chargement}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg"
                >
                  {chargement ? '⏳...' : '🔓 Réinitialiser'}
                </button>

                <button
                  onClick={() => {
                    setEtape(1);
                    setReponse('');
                    setNouveauMdp('');
                    setConfirmationMdp('');
                    setErreur('');
                  }}
                  className="w-full text-gray-500 dark:text-gray-400 py-2 text-sm"
                >
                  ← Retour
                </button>
              </>
            )}

            {/* Lien retour login */}
            <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Link
                to="/login"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}