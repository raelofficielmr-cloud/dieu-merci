import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useTaux } from '../context/TauxContext';
import { useAuth } from '../context/AuthContext';
import { parametreService, type Parametre } from '../services/parametreService';
import { authService, type UtilisateurListe } from '../services/authService';

export default function Parametres() {
  const { taux, setTaux } = useTaux();
  const { estProprietaire, role } = useAuth();
  const proprietaire = estProprietaire();

  const [, setParametres] = useState<Parametre | null>(null);
  const [sauvegardeTaux, setSauvegardeTaux] = useState(false);
  const [sauvegardeInfos, setSauvegardeInfos] = useState(false);

  const [entreprise, setEntreprise] = useState({
    nomEntreprise: '',
    adresse: '',
    telephone: '',
  });

  // Liste des utilisateurs (pour Papa)
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurListe[]>([]);
  const [cibleId, setCibleId] = useState<string>(''); // '' = soi-même

  // Changement mot de passe
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmationMdp, setConfirmationMdp] = useState('');
  const [messageMdp, setMessageMdp] = useState('');
  const [erreurMdp, setErreurMdp] = useState('');
  const [chargementMdp, setChargementMdp] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await parametreService.get();
        setParametres(data);
        setEntreprise({
          nomEntreprise: data.nomEntreprise,
          adresse: data.adresse,
          telephone: data.telephone,
        });

        // Charger la liste des utilisateurs si Papa
        if (proprietaire) {
          const users = await authService.getUtilisateurs();
          setUtilisateurs(users);
        }
      } catch (error) {
        console.error(error);
      }
    };
    charger();
  }, [proprietaire]);

  const enregistrerTaux = async () => {
    await setTaux(taux);
    setSauvegardeTaux(true);
    setTimeout(() => setSauvegardeTaux(false), 2000);
  };

  const enregistrerInfos = async () => {
    try {
      await parametreService.update(entreprise);
      setSauvegardeInfos(true);
      setTimeout(() => setSauvegardeInfos(false), 2000);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const changerLeMotDePasse = async () => {
    setErreurMdp('');
    setMessageMdp('');

    const changeAutre = cibleId && cibleId !== '';

    if (!changeAutre) {
      // On change SON PROPRE mot de passe
      if (!ancienMdp) return setErreurMdp('Entrez votre ancien mot de passe');
    }

    if (nouveauMdp.length < 4)
      return setErreurMdp('Le nouveau mot de passe doit faire au moins 4 caractères');
    if (nouveauMdp !== confirmationMdp)
      return setErreurMdp('Les deux mots de passe ne correspondent pas');

    setChargementMdp(true);
    try {
      await authService.changerMotDePasse(
        ancienMdp,
        nouveauMdp,
        changeAutre ? cibleId : undefined
      );
      setMessageMdp('✅ Mot de passe modifié avec succès !');
      setAncienMdp('');
      setNouveauMdp('');
      setConfirmationMdp('');
      setCibleId('');
      setTimeout(() => setMessageMdp(''), 3000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur lors du changement';
      setErreurMdp(msg);
    } finally {
      setChargementMdp(false);
    }
  };

  const utilisateurCible = utilisateurs.find((u) => u._id === cibleId);
  const changeAutre = cibleId !== '';

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-8 max-w-2xl">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6">
          ⚙️ Paramètres
        </h2>

        {/* Taux du jour */}
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 md:p-6 rounded-lg mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-2">
            💱 Taux du jour (CDF)
          </h3>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
            Modifiez le taux du jour. Il sera automatiquement synchronisé pour tous.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">1 USD =</span>
            <input
              type="number"
              value={taux}
              onChange={(e) => setTaux(Number(e.target.value))}
              className="w-32 md:w-40 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-green-500 text-lg font-bold"
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">CDF</span>
          </div>

          <button
            onClick={enregistrerTaux}
            className={`w-full font-bold py-3 rounded-lg transition-colors ${
              sauvegardeTaux
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {sauvegardeTaux ? '✅ Taux enregistré !' : '💾 Enregistrer le taux'}
          </button>
        </div>

        {/* Informations entreprise */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 md:p-6 rounded-lg mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-2">
            🏢 Informations de l'entreprise
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
              <input
                type="text"
                value={entreprise.nomEntreprise}
                onChange={(e) => setEntreprise({ ...entreprise, nomEntreprise: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
              <input
                type="text"
                value={entreprise.adresse}
                onChange={(e) => setEntreprise({ ...entreprise, adresse: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <input
                type="text"
                value={entreprise.telephone}
                onChange={(e) => setEntreprise({ ...entreprise, telephone: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
              />
            </div>
          </div>

          <button
            onClick={enregistrerInfos}
            className={`w-full font-bold py-3 rounded-lg mt-4 transition-colors ${
              sauvegardeInfos
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {sauvegardeInfos ? '✅ Infos enregistrées !' : '💾 Enregistrer les infos'}
          </button>
        </div>

        {/* Changement mot de passe (Propriétaire seulement) */}
        {proprietaire && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 md:p-6 rounded-lg">
            <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-2">
              🔐 Changer un mot de passe
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Changez votre mot de passe ou celui de l'informaticien.
            </p>

            {/* Sélection du compte */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Compte à modifier
              </label>
              <select
                value={cibleId}
                onChange={(e) => {
                  setCibleId(e.target.value);
                  setAncienMdp('');
                  setNouveauMdp('');
                  setConfirmationMdp('');
                  setErreurMdp('');
                  setMessageMdp('');
                }}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
              >
                <option value="">👑 Mon mot de passe (Propriétaire)</option>
                {utilisateurs
                  .filter((u) => u.role === 'Informaticien')
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      💻 {u.nom} (Informaticien)
                    </option>
                  ))}
              </select>
            </div>

            {/* Info sur le mode */}
            {changeAutre && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded text-xs text-yellow-800 dark:text-yellow-300 mb-4">
                ⚠️ Vous modifiez le mot de passe de <strong>{utilisateurCible?.nom}</strong>.
                L'ancien mot de passe n'est pas requis.
              </div>
            )}

            {/* Ancien mot de passe - SEULEMENT si on change le sien */}
            {!changeAutre && (
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ancien mot de passe
                </label>
                <input
                  type="password"
                  value={ancienMdp}
                  onChange={(e) => setAncienMdp(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  placeholder="••••"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                placeholder="••••"
              />
            </div>

            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmationMdp}
                onChange={(e) => setConfirmationMdp(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                placeholder="••••"
              />
            </div>

            {erreurMdp && (
              <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 text-red-700 dark:text-red-300 p-3 rounded text-sm mb-3">
                ⚠️ {erreurMdp}
              </div>
            )}
            {messageMdp && (
              <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-600 text-green-700 dark:text-green-300 p-3 rounded text-sm mb-3">
                {messageMdp}
              </div>
            )}

            <button
              onClick={changerLeMotDePasse}
              disabled={chargementMdp}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg"
            >
              {chargementMdp ? '⏳ Modification...' : '🔐 Changer le mot de passe'}
            </button>
          </div>
        )}

        {/* Pour l'informaticien : juste changer son propre mot de passe */}
        {!proprietaire && role === 'Informaticien' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 md:p-6 rounded-lg">
            <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-2">
              🔐 Changer mon mot de passe
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ancien mot de passe
                </label>
                <input
                  type="password"
                  value={ancienMdp}
                  onChange={(e) => setAncienMdp(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  placeholder="••••"
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
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  placeholder="••••"
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
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  placeholder="••••"
                />
              </div>
            </div>

            {erreurMdp && (
              <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 text-red-700 dark:text-red-300 p-3 rounded text-sm mt-3">
                ⚠️ {erreurMdp}
              </div>
            )}
            {messageMdp && (
              <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-600 text-green-700 dark:text-green-300 p-3 rounded text-sm mt-3">
                {messageMdp}
              </div>
            )}

            <button
              onClick={changerLeMotDePasse}
              disabled={chargementMdp}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg mt-4"
            >
              {chargementMdp ? '⏳ Modification...' : '🔐 Changer le mot de passe'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}