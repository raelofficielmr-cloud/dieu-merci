import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import {
  produitService,
  type Produit,
} from '../services/produitService';
import {
  genererJournalPDF,
  genererInventairePDF,
  genererFicheProduitPDF,
  type Mouvement,
} from '../utils/pdf';

const categoriesDisponibles = [
  'Alimentation',
  'Construction',
  'Cosmétique',
  'Divers',
  'Pièces Moto',
  'Pièces Vélo',
];

const unitesDisponibles = [
  'Pièces',
  'Boîtes',
  'Douzaines',
  'Cartons',
  'Sacs',
  'Kg',
  'Litres',
];

export default function Stock() {
  const { estInformaticien } = useAuth();
  const info = estInformaticien();

  const [produits, setProduits] = useState<Produit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('Toutes les catégories');
  const [filtrePrix, setFiltrePrix] = useState('Tous');
  const [dateJournal, setDateJournal] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [mouvements, setMouvements] = useState<Mouvement[]>([]);

  const [modalNouveauProduit, setModalNouveauProduit] = useState(false);
  const [modalAppro, setModalAppro] = useState(false);
  const [modalSortie, setModalSortie] = useState(false);
  const [modalPoids, setModalPoids] = useState(false);
  const [produitActif, setProduitActif] = useState<Produit | null>(null);

  const [nouveauProduit, setNouveauProduit] = useState({
    nom: '',
    categorie: 'Alimentation',
    unite: 'Pièces',
  });

  const [mouvementForm, setMouvementForm] = useState({
    date: new Date().toISOString().split('T')[0],
    quantite: 0,
    unite: '',
  });

  const [nouveauPoids, setNouveauPoids] = useState(0);

  // ========== CHARGER LES PRODUITS ==========
  const chargerProduits = async () => {
    try {
      setChargement(true);
      const data = await produitService.getAll();
      setProduits(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      alert('Erreur de connexion au serveur');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerProduits();
  }, []);

  // ========== FILTRES ==========
  const produitsFiltres = produits.filter((p) => {
    const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase());
    const matchCategorie =
      filtreCategorie === 'Toutes les catégories' || p.categorie === filtreCategorie;
    const matchPrix =
      filtrePrix === 'Tous' ||
      (filtrePrix === 'Sans prix' && p.prixUnitaire === 0) ||
      (filtrePrix === 'Avec prix' && p.prixUnitaire > 0);
    return matchRecherche && matchCategorie && matchPrix;
  });

  // ========== AJOUTER UN PRODUIT ==========
  const ajouterProduit = async () => {
    if (!nouveauProduit.nom.trim()) return alert('Entrez un nom');
    try {
      const nouveau = await produitService.create({
        nom: nouveauProduit.nom.trim().toUpperCase(),
        categorie: nouveauProduit.categorie,
        unite: nouveauProduit.unite,
        description: '',
        poids: 0,
        quantite: 0,
        prixUnitaire: 0,
        prixVenteLot: 0,
        prixAchat: 0,
        marge: 5,
        piecesParLot: 1,
        lotGros: 1,
        seuilAlerte: 10,
      });
      setProduits([nouveau, ...produits]);
      setNouveauProduit({ nom: '', categorie: 'Alimentation', unite: 'Pièces' });
      setModalNouveauProduit(false);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la création');
    }
  };

  // ========== OUVRIR MODALS ==========
  const ouvrirAppro = (p: Produit) => {
    setProduitActif(p);
    setMouvementForm({
      date: new Date().toISOString().split('T')[0],
      quantite: 0,
      unite: p.unite,
    });
    setModalAppro(true);
  };

  const ouvrirSortie = (p: Produit) => {
    setProduitActif(p);
    setMouvementForm({
      date: new Date().toISOString().split('T')[0],
      quantite: 0,
      unite: p.unite,
    });
    setModalSortie(true);
  };

  const ouvrirPoids = (p: Produit) => {
    setProduitActif(p);
    setNouveauPoids(p.poids);
    setModalPoids(true);
  };

  // ========== VALIDER APPRO ==========
  const validerAppro = async () => {
    if (mouvementForm.quantite <= 0) return alert('Entrez une quantité');
    if (!produitActif) return;

    try {
      const updated = await produitService.approvisionner(
        produitActif._id,
        mouvementForm.quantite,
        mouvementForm.unite
      );
      setProduits(produits.map((p) => (p._id === updated._id ? updated : p)));

      setMouvements([
        ...mouvements,
        {
          date: mouvementForm.date,
          produit: produitActif.nom,
          type: 'Entrée',
          quantite: mouvementForm.quantite,
          unite: mouvementForm.unite,
          utilisateur: 'Informaticien',
        },
      ]);

      setModalAppro(false);
      setProduitActif(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'approvisionnement');
    }
  };

  // ========== VALIDER SORTIE ==========
  const validerSortie = async () => {
    if (mouvementForm.quantite <= 0) return alert('Entrez une quantité');
    if (!produitActif) return;
    if (mouvementForm.quantite > produitActif.quantite)
      return alert('Quantité supérieure au stock disponible');

    try {
      const updated = await produitService.update(produitActif._id, {
        quantite: produitActif.quantite - mouvementForm.quantite,
        unite: mouvementForm.unite,
      });
      setProduits(produits.map((p) => (p._id === updated._id ? updated : p)));

      setMouvements([
        ...mouvements,
        {
          date: mouvementForm.date,
          produit: produitActif.nom,
          type: 'Sortie',
          quantite: mouvementForm.quantite,
          unite: mouvementForm.unite,
          utilisateur: 'Informaticien',
        },
      ]);

      setModalSortie(false);
      setProduitActif(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sortie');
    }
  };

  // ========== VALIDER POIDS ==========
  const validerPoids = async () => {
    if (!produitActif) return;
    try {
      const updated = await produitService.update(produitActif._id, {
        poids: nouveauPoids,
      });
      setProduits(produits.map((p) => (p._id === updated._id ? updated : p)));
      setModalPoids(false);
      setProduitActif(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la modification du poids');
    }
  };

  // ========== SUPPRIMER ==========
  const supprimerProduit = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) {
      try {
        await produitService.delete(id);
        setProduits(produits.filter((p) => p._id !== id));
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // ========== PDF ==========
  const genererJournal = async () => {
    const mouvementsDuJour = mouvements.filter((m) => m.date === dateJournal);
    await genererJournalPDF(dateJournal, mouvementsDuJour, produits as any);
  };

  const imprimerInventaire = async () => {
    await genererInventairePDF(produits as any);
  };

  const imprimerProduit = async (p: Produit) => {
    await genererFicheProduitPDF(p as any);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gestion du Stock
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Contrôle complet des marchandises.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
          <span>📦</span> Inventaire Global
        </h2>

        {/* Mouvement du stock */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
          <label className="font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
            Mouvement du stock
          </label>
          <input
            type="date"
            value={dateJournal}
            onChange={(e) => setDateJournal(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg"
          />
          <button
            onClick={genererJournal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg whitespace-nowrap"
          >
            GÉNÉRER LE JOURNAL
          </button>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-6">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="md:col-span-4 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filtreCategorie}
            onChange={(e) => setFiltreCategorie(e.target.value)}
            className="md:col-span-3 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          >
            <option>Toutes les catégories</option>
            {categoriesDisponibles.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={filtrePrix}
            onChange={(e) => setFiltrePrix(e.target.value)}
            className="md:col-span-3 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          >
            <option>Tous</option>
            <option>Sans prix</option>
            <option>Avec prix</option>
          </select>

          {info ? (
            <button
              onClick={() => setModalNouveauProduit(true)}
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <span>➕</span> Nouveau
            </button>
          ) : (
            <button
              onClick={imprimerInventaire}
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              🖨️ Imprimer
            </button>
          )}
        </div>

        {info && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={imprimerInventaire}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2"
            >
              🖨️ Imprimer l'inventaire
            </button>
          </div>
        )}

        {/* Tableau */}
        {chargement ? (
          <p className="text-center py-12 text-gray-500">Chargement...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">N°</th>
                  <th className="text-left px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">PRODUIT</th>
                  <th className="text-left px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">POIDS</th>
                  <th className="text-left px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">QUANTITÉ</th>
                  <th className="text-right px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">P.U (USD)</th>
                  <th className="text-right px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">TOTAL (USD)</th>
                  <th className="text-center px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {produitsFiltres.map((p, index) => {
                  const sansPrix = p.prixUnitaire === 0;
                  const total = p.quantite * p.prixUnitaire;
                  return (
                    <tr
                      key={p._id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        sansPrix ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <td className="px-3 py-4 text-gray-700 dark:text-gray-300">{index + 1}</td>
                      <td className="px-3 py-4">
                        <p className="font-bold text-gray-800 dark:text-white">{p.nom}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {p.description || '—'}
                        </p>
                      </td>
                      <td
                        className="px-3 py-4 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700"
                        onClick={() => ouvrirPoids(p)}
                        title="Cliquer pour modifier le poids"
                      >
                        {p.poids} Kg ✏️
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          {p.quantite} {p.unite}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right font-bold text-gray-800 dark:text-white">
                        {p.prixUnitaire.toFixed(2)}
                      </td>
                      <td className="px-3 py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                        {total.toFixed(2)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {info && (
                            <>
                              <button
                                onClick={() => ouvrirAppro(p)}
                                className="bg-green-500 hover:bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold"
                                title="Approvisionner"
                              >
                                +
                              </button>
                              <button
                                onClick={() => ouvrirSortie(p)}
                                className="bg-orange-500 hover:bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold"
                                title="Sortie de stock"
                              >
                                −
                              </button>
                            </>
                          )}

                          {!info && (
                            <button
                              onClick={() => supprimerProduit(p._id)}
                              className="text-red-500 hover:text-red-700 text-lg"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          )}

                          <button
                            onClick={() => imprimerProduit(p)}
                            className="text-blue-500 hover:text-blue-700 text-lg"
                            title="Imprimer"
                          >
                            🖨️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {produitsFiltres.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Aucun produit. {info ? 'Cliquez sur "+ Nouveau" pour en ajouter.' : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========== MODAL NOUVEAU PRODUIT ========== */}
      {modalNouveauProduit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nouveau Produit</h2>
              <button onClick={() => setModalNouveauProduit(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'article</label>
                <input
                  type="text"
                  value={nouveauProduit.nom}
                  onChange={(e) => setNouveauProduit({ ...nouveauProduit, nom: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  placeholder="Ex: BOUGIE DT"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                  <select
                    value={nouveauProduit.categorie}
                    onChange={(e) => setNouveauProduit({ ...nouveauProduit, categorie: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  >
                    {categoriesDisponibles.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unité</label>
                  <select
                    value={nouveauProduit.unite}
                    onChange={(e) => setNouveauProduit({ ...nouveauProduit, unite: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  >
                    {unitesDisponibles.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button onClick={ajouterProduit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL APPRO ========== */}
      {modalAppro && produitActif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Approvisionner : {produitActif.nom}
              </h2>
              <button onClick={() => setModalAppro(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  value={mouvementForm.date}
                  onChange={(e) => setMouvementForm({ ...mouvementForm, date: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantité à ajouter
                </label>
                <input
                  type="number"
                  min="1"
                  value={mouvementForm.quantite || ''}
                  onChange={(e) => setMouvementForm({ ...mouvementForm, quantite: Number(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unité</label>
                <select
                  value={mouvementForm.unite}
                  onChange={(e) => setMouvementForm({ ...mouvementForm, unite: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                >
                  {unitesDisponibles.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button onClick={validerAppro} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                Approvisionner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL SORTIE ========== */}
      {modalSortie && produitActif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Sortie : {produitActif.nom}
              </h2>
              <button onClick={() => setModalSortie(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded text-sm">
                Stock actuel : <strong>{produitActif.quantite} {produitActif.unite}</strong>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  value={mouvementForm.date}
                  onChange={(e) => setMouvementForm({ ...mouvementForm, date: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité à retirer</label>
                <input
                  type="number"
                  min="1"
                  value={mouvementForm.quantite || ''}
                  onChange={(e) => setMouvementForm({ ...mouvementForm, quantite: Number(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unité</label>
                <select
                  value={mouvementForm.unite}
                  onChange={(e) => setMouvementForm({ ...mouvementForm, unite: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                >
                  {unitesDisponibles.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button onClick={validerSortie} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg">
                Retirer du stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL POIDS ========== */}
      {modalPoids && produitActif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Poids : {produitActif.nom}
              </h2>
              <button onClick={() => setModalPoids(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <div className="p-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Poids (Kg)</label>
              <input
                type="number"
                step="0.01"
                value={nouveauPoids}
                onChange={(e) => setNouveauPoids(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
              />
            </div>

            <div className="p-6 pt-0">
              <button onClick={validerPoids} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}