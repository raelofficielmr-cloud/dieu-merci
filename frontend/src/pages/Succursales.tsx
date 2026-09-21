import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useTaux } from '../context/TauxContext';
import { succursaleService, type Succursale } from '../services/succursaleService';
import { versementService } from '../services/versementService';

export default function Succursales() {
  const { taux } = useTaux();

  const [succursales, setSuccursales] = useState<Succursale[]>([]);
  const [chargement, setChargement] = useState(true);

  const [nouvelle, setNouvelle] = useState({
    nom: '',
    adresse: '',
    telephone: '',
  });

  // Modal versement
  const [modalOuvert, setModalOuvert] = useState(false);
  const [succursaleActive, setSuccursaleActive] = useState<Succursale | null>(null);
  const [versementForm, setVersementForm] = useState({
    date: new Date().toISOString().split('T')[0],
    verseUSD: 0,
    verseCDF: 0,
  });

  // Modal modification
  const [modalModifOuvert, setModalModifOuvert] = useState(false);
  const [succursaleModif, setSuccursaleModif] = useState<Succursale | null>(null);
  const [formModif, setFormModif] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    detteActuelle: 0,
  });

  // ========== CHARGER LES SUCCURSALES ==========
  const chargerSuccursales = async () => {
    try {
      setChargement(true);
      const data = await succursaleService.getAll();
      setSuccursales(data);
    } catch (error) {
      console.error(error);
      alert('Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerSuccursales();
  }, []);

  // ========== AJOUTER ==========
  const ajouterSuccursale = async () => {
    if (!nouvelle.nom.trim()) return alert('Entrez un nom');
    try {
      const nouvelleSucc = await succursaleService.create({
        nom: nouvelle.nom.trim(),
        adresse: nouvelle.adresse.trim(),
        telephone: nouvelle.telephone.trim(),
        detteActuelle: 0,
        actif: true,
      });
      setSuccursales([...succursales, nouvelleSucc]);
      setNouvelle({ nom: '', adresse: '', telephone: '' });
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la création');
    }
  };

  // ========== SUPPRIMER ==========
  const supprimerSuccursale = async (id: string) => {
    if (confirm('Supprimer cette succursale ?')) {
      try {
        await succursaleService.delete(id);
        setSuccursales(succursales.filter((s) => s._id !== id));
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // ========== MODIFIER ==========
  const ouvrirModification = (s: Succursale) => {
    setSuccursaleModif(s);
    setFormModif({
      nom: s.nom,
      adresse: s.adresse,
      telephone: s.telephone,
      detteActuelle: s.detteActuelle,
    });
    setModalModifOuvert(true);
  };

  const enregistrerModifications = async () => {
    if (!succursaleModif) return;
    if (!formModif.nom.trim()) return alert('Entrez un nom');

    try {
      const updated = await succursaleService.update(succursaleModif._id, formModif);
      setSuccursales(succursales.map((s) => (s._id === updated._id ? updated : s)));
      setModalModifOuvert(false);
      setSuccursaleModif(null);
      alert('✅ Succursale modifiée !');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la modification');
    }
  };

  // ========== VERSEMENT ==========
  const ouvrirVersement = (s: Succursale) => {
    setSuccursaleActive(s);
    setVersementForm({
      date: new Date().toISOString().split('T')[0],
      verseUSD: 0,
      verseCDF: 0,
    });
    setModalOuvert(true);
  };

  const validerVersement = async () => {
    if (!succursaleActive) return;
    if (versementForm.verseUSD <= 0 && versementForm.verseCDF <= 0) {
      return alert('Entrez un montant');
    }

    try {
      await versementService.create({
        succursaleId: succursaleActive._id,
        date: versementForm.date,
        verseUSD: versementForm.verseUSD,
        verseCDF: versementForm.verseCDF,
        taux: taux,
      });

      // Recharger pour avoir la dette à jour
      await chargerSuccursales();
      setModalOuvert(false);
      setSuccursaleActive(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors du versement');
    }
  };

  const formaterDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Mes Succursales
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gérer vos succursales et leurs dettes
        </p>
      </div>

      {/* Ajout succursale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
          <span>➕</span> Ajout d'une succursale
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            type="text"
            placeholder="Nom Succursale"
            value={nouvelle.nom}
            onChange={(e) => setNouvelle({ ...nouvelle, nom: e.target.value })}
            className="md:col-span-4 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          />
          <input
            type="text"
            placeholder="Adresse"
            value={nouvelle.adresse}
            onChange={(e) => setNouvelle({ ...nouvelle, adresse: e.target.value })}
            className="md:col-span-4 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={nouvelle.telephone}
            onChange={(e) => setNouvelle({ ...nouvelle, telephone: e.target.value })}
            className="md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          />
          <button
            onClick={ajouterSuccursale}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste succursales */}
      {chargement ? (
        <p className="text-center py-12 text-gray-500">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {succursales.map((s) => (
            <div
              key={s._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {s.nom}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    📍 {s.adresse || '—'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📞 {s.telephone || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => ouvrirModification(s)}
                    className="text-blue-500 hover:text-blue-700 text-xl"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => supprimerSuccursale(s._id)}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 tracking-wider">
                    DETTE ACTUELLE
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {s.detteActuelle.toFixed(2)}{' '}
                    <span className="text-sm">USD</span>
                  </p>
                </div>
                <button
                  onClick={() => ouvrirVersement(s)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
                >
                  Encaisser
                </button>
              </div>
            </div>
          ))}
          {succursales.length === 0 && (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-400">Aucune succursale. Ajoutez-en une !</p>
            </div>
          )}
        </div>
      )}

      {/* Modal modification */}
      {modalModifOuvert && succursaleModif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Modifier la succursale
              </h2>
              <button
                onClick={() => setModalModifOuvert(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                <input
                  type="text"
                  value={formModif.nom}
                  onChange={(e) => setFormModif({ ...formModif, nom: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                <input
                  type="text"
                  value={formModif.adresse}
                  onChange={(e) => setFormModif({ ...formModif, adresse: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                <input
                  type="text"
                  value={formModif.telephone}
                  onChange={(e) => setFormModif({ ...formModif, telephone: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dette actuelle (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formModif.detteActuelle}
                  onChange={(e) => setFormModif({ ...formModif, detteActuelle: Number(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1 font-bold"
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setModalModifOuvert(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={enregistrerModifications}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal versement */}
      {modalOuvert && succursaleActive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-bold">💰 Versement</h2>
              <button
                onClick={() => setModalOuvert(false)}
                className="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom de la succursale :</p>
                <p className="font-bold text-gray-800 dark:text-white">{succursaleActive.nom}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4 flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300 font-medium">Dette actuelle :</span>
                <span className="text-blue-700 dark:text-blue-300 font-bold text-lg">
                  {succursaleActive.detteActuelle.toFixed(2)} USD
                </span>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Date :</label>
                <input
                  type="date"
                  value={versementForm.date}
                  onChange={(e) => setVersementForm({ ...versementForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg mt-1"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">VERSEMENTS</p>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={versementForm.verseCDF || ''}
                    onChange={(e) => setVersementForm({ ...versementForm, verseCDF: Number(e.target.value) })}
                    className="flex-1 px-3 py-3 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg text-lg font-bold"
                    placeholder="0"
                  />
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-600 rounded-lg font-bold text-gray-700 dark:text-white">
                    CDF
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={versementForm.verseUSD || ''}
                    onChange={(e) => setVersementForm({ ...versementForm, verseUSD: Number(e.target.value) })}
                    className="flex-1 px-3 py-3 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg text-lg font-bold"
                    placeholder="0"
                  />
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-600 rounded-lg font-bold text-gray-700 dark:text-white">
                    USD
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-2">
              <button
                onClick={validerVersement}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
              >
                Valider le versement
              </button>
              <button
                onClick={() => setModalOuvert(false)}
                className="w-full text-gray-500 dark:text-gray-400 py-2 font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}