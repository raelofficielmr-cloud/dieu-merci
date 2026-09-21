import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useTaux } from '../context/TauxContext';
import { useAuth } from '../context/AuthContext';
import { parametreService, type Parametre } from '../services/parametreService';

export default function Parametres() {
  const { taux, setTaux } = useTaux();
  const { estProprietaire } = useAuth();
  const proprietaire = estProprietaire();

  const [, setParametres] = useState<Parametre | null>(null);
  const [sauvegardeTaux, setSauvegardeTaux] = useState(false);
  const [sauvegardeInfos, setSauvegardeInfos] = useState(false);

  const [entreprise, setEntreprise] = useState({
    nomEntreprise: '',
    adresse: '',
    telephone: '',
  });

  // Charger les paramètres
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
      } catch (error) {
        console.error(error);
      }
    };
    charger();
  }, []);

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

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          ⚙️ Paramètres
        </h2>

        {/* Taux du jour */}
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            💱 Taux du jour (CDF)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Modifiez le taux du jour. Il sera automatiquement synchronisé pour tous.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">1 USD =</span>
            <input
              type="number"
              value={taux}
              onChange={(e) => setTaux(Number(e.target.value))}
              className="w-40 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-green-500 text-lg font-bold"
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
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
          <div className="bg-gray-50 dark:bg-gray-700 border-l-4 border-gray-400 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              🔐 Changer un mot de passe
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              (Fonctionnalité à venir avec le backend)
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}