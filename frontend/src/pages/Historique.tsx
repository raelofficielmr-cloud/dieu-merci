import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { historiqueService, type Historique as HistoriqueType, type TypeActivite } from '../services/historiqueService';
import { genererHistoriquePDF } from '../utils/pdf';

export default function Historique() {
  const [activites, setActivites] = useState<HistoriqueType[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreActivite, setFiltreActivite] = useState<TypeActivite | 'Livraison'>('Livraison');
  const [filtreSuccursale, setFiltreSuccursale] = useState('Toutes les succursales');
  const [filtreDate, setFiltreDate] = useState('');
  const [grouperParMois, setGrouperParMois] = useState(false);

  // Charger depuis MongoDB
  const chargerHistorique = async () => {
    try {
      setChargement(true);
      const data = await historiqueService.getAll();
      setActivites(data);
    } catch (error) {
      console.error(error);
      alert('Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerHistorique();
  }, []);

  // Liste des succursales uniques
  const succursalesUniques = Array.from(
    new Set(activites.filter((a) => a.succursale).map((a) => a.succursale!))
  );

  // Filtrer
  const activitesFiltrees = activites.filter((a) => {
    const matchType = a.type === filtreActivite;
    const matchSuccursale =
      filtreSuccursale === 'Toutes les succursales' || a.succursale === filtreSuccursale;
    const matchDate = !filtreDate || a.date.split('T')[0] === filtreDate;
    const matchRecherche =
      !recherche ||
      a.produit?.toLowerCase().includes(recherche.toLowerCase()) ||
      a.succursale?.toLowerCase().includes(recherche.toLowerCase());
    return matchType && matchSuccursale && matchDate && matchRecherche;
  });

  const valeurTotale = activitesFiltrees.reduce(
    (acc, a) => acc + (a.montant || 0),
    0
  );

  const totalCredits = activites
    .filter((a) => a.type === 'Versement')
    .reduce((acc, a) => acc + (a.montant || 0), 0);

  // Supprimer
  const supprimerLigne = async (id: string) => {
    if (confirm("Supprimer cette ligne de l'historique ?")) {
      try {
        await historiqueService.delete(id);
        setActivites(activites.filter((a) => a._id !== id));
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const imprimerHistorique = () => {
    genererHistoriquePDF(
      activitesFiltrees.map((a) => ({
        ...a,
        date: a.date.split('T')[0],
      })) as any,
      filtreActivite,
      valeurTotale,
      totalCredits
    );
  };

  const formaterDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
  };

  const formaterMois = (dateStr: string) => {
    const mois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];
    const d = new Date(dateStr);
    return `${mois[d.getMonth()]} ${d.getFullYear()}`;
  };

  const activitesGroupees = activitesFiltrees.reduce((acc, a) => {
    const mois = formaterMois(a.date);
    if (!acc[mois]) acc[mois] = [];
    acc[mois].push(a);
    return acc;
  }, {} as Record<string, HistoriqueType[]>);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Historiques</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Suivi des livraisons, versements et approvisionnements.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🔄 Historiques des activités
          </h2>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            />

            <button
              onClick={imprimerHistorique}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              🖨️ Imprimer
            </button>
          </div>
        </div>

        {/* Totaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Valeur totale :</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {valeurTotale.toFixed(2)} USD
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total crédits</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalCredits.toFixed(2)} USD
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quelle activité ?
            </label>
            <select
              value={filtreActivite}
              onChange={(e) => setFiltreActivite(e.target.value as TypeActivite)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
            >
              <option value="Livraison">Les livraisons aux POS</option>
              <option value="Approvisionnement">Les approvisionnements</option>
              <option value="Sortie">Les sorties de stock</option>
              <option value="Versement">Les versements</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Succursale :
            </label>
            <select
              value={filtreSuccursale}
              onChange={(e) => setFiltreSuccursale(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
            >
              <option>Toutes les succursales</option>
              {succursalesUniques.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date :
            </label>
            <input
              type="date"
              value={filtreDate}
              onChange={(e) => setFiltreDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Option de vue
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="grouper"
                checked={grouperParMois}
                onChange={(e) => setGrouperParMois(e.target.checked)}
                className="w-5 h-5 accent-blue-600"
              />
              <label htmlFor="grouper" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Grouper par mois
              </label>
            </div>
          </div>
        </div>

        {/* Tableau */}
        {chargement ? (
          <p className="text-center py-12 text-gray-500">Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            {grouperParMois ? (
              Object.entries(activitesGroupees).map(([mois, list]) => (
                <div key={mois} className="mb-6">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-t-lg flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 dark:text-white">{mois}</h3>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      Total : {list.reduce((acc, a) => acc + (a.montant || 0), 0).toFixed(2)} USD
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {list.map((a) => (
                        <tr key={a._id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                            {formaterDate(a.date)}
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-800 dark:text-white">
                            {a.succursale || a.produit}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-500 dark:text-gray-400">
                            {a.quantite ? `${a.quantite} ${a.unite}` : ''}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-green-600 dark:text-green-400">
                            {a.montant ? `${a.montant.toFixed(2)} USD` : ''}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => supprimerLigne(a._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">DATE</th>
                    {filtreActivite === 'Approvisionnement' || filtreActivite === 'Sortie' ? (
                      <>
                        <th className="text-left px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">PRODUIT</th>
                        <th className="text-right px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">QUANTITÉ</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">SUCCURSALE</th>
                        <th className="text-right px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">MONTANT (USD)</th>
                      </>
                    )}
                    <th className="text-center px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">ANNULER</th>
                  </tr>
                </thead>
                <tbody>
                  {activitesFiltrees.map((a) => (
                    <tr
                      key={a._id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-3 py-4 text-gray-600 dark:text-gray-300">
                        {formaterDate(a.date)}
                      </td>
                      {filtreActivite === 'Approvisionnement' || filtreActivite === 'Sortie' ? (
                        <>
                          <td className="px-3 py-4 font-medium text-gray-800 dark:text-white">
                            {a.produit}
                          </td>
                          <td className="px-3 py-4 text-right text-gray-700 dark:text-gray-300">
                            {a.quantite} {a.unite}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-4 font-medium text-gray-800 dark:text-white">
                            {a.succursale}
                          </td>
                          <td className="px-3 py-4 text-right font-bold text-green-600 dark:text-green-400">
                            {a.montant?.toFixed(2)}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => supprimerLigne(a._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activitesFiltrees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        Aucune activité trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}