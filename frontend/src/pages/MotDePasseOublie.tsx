import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function MotDePasseOublie() {
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'Proprietaire' | 'Informaticien'>('Proprietaire');
  const [question, setQuestion] = useState('');
  const [nom, setNom] = useState('');
  const [reponse, setReponse] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmationMdp, setConfirmationMdp] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  // Étape 1 : choisir le compte
  const choisirCompte = async () => {
    setErreur('');
    setChargement(true);
    try {
      const data = await authService.getQuestionSecurite(role);
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

  // Étape 2 : vérifier la réponse (on envoie avec un MDP bidon pour valider, puis étape 3)
  const verifierReponse = async () => {
    setErreur('');
    if (!reponse.trim()) return setErreur('Entrez votre réponse');
    setEtape(3);
  };

  // Étape 3 : réinitialiser
  const reinitialiser = async () => {
    setErreur('');
    setMessage('');

    if (nouveauMdp.length < 4) return setErreur('Le mot de passe doit faire au moins 4 caractères');
    if (nouveauMdp !== confirmationMdp) return setErreur('Les deux mots de passe ne correspondent pas');

    setChargement(true);
    try {
      await authService.reinitialiserMotDePasse(role, reponse, nouveauMdp);
      setMessage('✅ Mot de passe réinitialisé ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur';
      setErreur(msg);
      // Si réponse incorrecte, retour à l'étape 2
      if (error.response?.status === 401) {
        setEtape(2);
      }
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
              Récupérez votre accès
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

            {/* ÉTAPE 1 */}
            {etape === 1 && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sélectionnez votre compte :
                </p>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as 'Proprietaire' | 'Informaticien')
                  }
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                >
                  <option value="Proprietaire">👑 Propriétaire (Papa)</option>
                  <option value="Informaticien">💻 Informaticien</option>
                </select>
                <button
                  onClick={choisirCompte}
                  disabled={chargement}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg"
                >
                  {chargement ? '⏳...' : 'Continuer'}
                </button>
              </>
            )}

            {/* ÉTAPE 2 */}
            {etape === 2 && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Compte : <strong>{nom}</strong>
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {question}
                </p>
                <input
                  type="text"
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  placeholder="Votre réponse..."
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                  autoFocus
                />
                <button
                  onClick={verifierReponse}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                >
                  Valider
                </button>
              </>
            )}

            {/* ÉTAPE 3 */}
            {etape === 3 && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Définissez un nouveau mot de passe :
                </p>
                <input
                  type="password"
                  value={nouveauMdp}
                  onChange={(e) => setNouveauMdp(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
                <input
                  type="password"
                  value={confirmationMdp}
                  onChange={(e) => setConfirmationMdp(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
                <button
                  onClick={reinitialiser}
                  disabled={chargement}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg"
                >
                  {chargement ? '⏳...' : '🔓 Réinitialiser'}
                </button>
              </>
            )}

            {/* Lien retour */}
            <div className="text-center pt-2">
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