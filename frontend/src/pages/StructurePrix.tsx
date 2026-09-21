import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTaux } from '../context/TauxContext';
import { produitService, type Produit } from '../services/produitService';
import { genererStructurePrixPDF } from '../utils/pdfStructure';

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

export default function StructurePrix() {
  const { estProprietaire } = useAuth();
  const proprietaire = estProprietaire();
  const { taux } = useTaux();

  const [produits, setProduits] = useState<Produit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('Toutes les catégories');
  const [filtreTri, setFiltreTri] = useState('Sans le prix de vente');

  const [modalOuvert, setModalOuvert] = useState(false);
  const [produitActif, setProduitActif] = useState<Produit | null>(null);

  const [form, setForm] = useState({
    nom: '',
    poids: 0,
    categorie: 'Alimentation',
    unite: 'Cartons',
    prixAchat: 0,
    seuil: 0,
    taux: taux,
    marge: 5,
    nbreArrondi: 100,
    piecesParLot: 1,
    lotGros: 1,
    sousUnite: 'Boîtes',
    nbreCartons: 1,
  });

  const chargerProduits = async () => {
    try {
      setChargement(true);
      const data = await produitService.getAll();
      setProduits(data);
    } catch (error) {
      console.error(error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerProduits();
  }, []);

  const pvUnitaireUSD = form.prixAchat * (1 + form.marge / 100);
  const margeBenefUSD = pvUnitaireUSD - form.prixAchat;
  const margeBenefCDF = margeBenefUSD * form.taux;
  const pvParPieceUSD = form.piecesParLot > 0 ? pvUnitaireUSD / form.piecesParLot : 0;
  const pvParPieceCDF = pvParPieceUSD * form.taux;
  const pvAuGrosUSD = pvParPieceUSD * form.lotGros;
  const pvAuGrosCDF = pvAuGrosUSD * form.taux;
  const pvSortieUSD = pvUnitaireUSD * form.nbreCartons;
  const pvSortieCDF = pvSortieUSD * form.taux;

  const produitsFiltres = produits
    .filter((p) => {
      const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase());
      const matchCategorie = filtreCategorie === 'Toutes les catégories' || p.categorie === filtreCategorie;
      return matchRecherche && matchCategorie;
    })
    .sort((a, b) => {
      if (filtreTri === 'Ordre Alphabétique') return a.nom.localeCompare(b.nom);
      if (filtreTri === 'Sans le prix de vente') {
        if (a.prixUnitaire === 0 && b.prixUnitaire !== 0) return -1;
        if (a.prixUnitaire !== 0 && b.prixUnitaire === 0) return 1;
      }
      return 0;
    });

  const ouvrirModifier = (p: Produit) => {
    setProduitActif(p);
    setForm({
      nom: p.nom,
      poids: p.poids,
      categorie: p.categorie,
      unite: p.unite,
      prixAchat: p.prixAchat,
      seuil: 0,
      taux: taux,
      marge: p.marge || 5,
      nbreArrondi: 100,
      piecesParLot: p.piecesParLot || 1,
      lotGros: p.lotGros || 1,
      sousUnite: p.sousUnite || 'Boîtes',
      nbreCartons: 1,
    });
    setModalOuvert(true);
  };

  const mettreAJour = async () => {
    if (!produitActif) return;
    try {
      const updated = await produitService.update(produitActif._id, {
        nom: form.nom,
        poids: form.poids,
        categorie: form.categorie,
        unite: form.unite,
        prixAchat: form.prixAchat,
        prixUnitaire: pvParPieceUSD,
        prixVenteLot: pvAuGrosUSD,
        marge: form.marge,
        piecesParLot: form.piecesParLot,
        lotGros: form.lotGros,
        sousUnite: form.sousUnite,
      });
      setProduits(produits.map((p) => (p._id === updated._id ? updated : p)));
      setModalOuvert(false);
      setProduitActif(null);
      alert('✅ Tarif mis à jour !');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const imprimerStructure = () => {
    genererStructurePrixPDF(produitsFiltres as any, taux);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Structure de Prix</h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Imprimer facilement la structure de prix.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 md:p-6 transition-colors">
        <h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 md:mb-6">
          💎 Structure des Prix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 md:mb-6">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="md:col-span-4 px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
          />
          <select
            value={filtreCategorie}
            onChange={(e) => setFiltreCategorie(e.target.value)}
            className="md:col-span-3 px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
          >
            <option>Toutes les catégories</option>
            {categoriesDisponibles.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={filtreTri}
            onChange={(e) => setFiltreTri(e.target.value)}
            className="md:col-span-3 px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
          >
            <option>Sans le prix de vente</option>
            <option>Ordre Alphabétique</option>
            <option>Date d'enregistrement</option>
          </select>
          <button
            onClick={imprimerStructure}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
          >
            🖨️ Imprimer
          </button>
        </div>

        {chargement ? (
          <p className="text-center py-12 text-gray-500">Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm" style={{ minWidth: '700px' }}>
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-2 md:px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">N°</th>
                  <th className="text-left px-2 md:px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">PRODUIT</th>
                  <th className="text-left px-2 md:px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">POIDS</th>
                  <th className="text-right px-2 md:px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">P.V UNIT</th>
                  <th className="text-right px-2 md:px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">P.V LOT</th>
                  <th className="text-right px-2 md:px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">MARGE</th>
                  <th className="text-center px-2 md:px-3 py-3 text-gray-500 dark:text-gray-400 font-medium">MODIFIER</th>
                </tr>
              </thead>
              <tbody>
                {produitsFiltres.map((p, index) => {
                  const sansPrix = p.prixUnitaire === 0;
                  return (
                    <tr
                      key={p._id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        sansPrix ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <td className="px-2 md:px-3 py-3 text-gray-700 dark:text-gray-300">{index + 1}</td>
                      <td className="px-2 md:px-3 py-3">
                        <p className="font-bold text-gray-800 dark:text-white">{p.nom}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{p.description}</p>
                      </td>
                      <td className="px-2 md:px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{p.poids} Kg</td>
                      <td className="px-2 md:px-3 py-3 text-right whitespace-nowrap">
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {sansPrix ? '0 FC' : `${(p.prixUnitaire * taux).toFixed(0)} FC`}
                        </p>
                        <p className="text-[10px] text-gray-500">{p.prixUnitaire.toFixed(2)} USD</p>
                      </td>
                      <td className="px-2 md:px-3 py-3 text-right whitespace-nowrap">
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {sansPrix ? '0 FC' : `${(p.prixVenteLot * taux).toFixed(0)} FC`}
                        </p>
                        <p className="text-[10px] text-gray-500">{p.prixVenteLot.toFixed(2)} USD</p>
                      </td>
                      <td className="px-2 md:px-3 py-3 text-right font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                        + {(p.prixUnitaire * p.marge / 100 * taux).toFixed(0)} FC
                      </td>
                      <td className="px-2 md:px-3 py-3 text-center">
                        {proprietaire ? (
                          <button
                            onClick={() => ouvrirModifier(p)}
                            className="text-blue-500 hover:text-blue-700 text-lg"
                          >
                            ✏️
                          </button>
                        ) : (
                          <span className="text-gray-300 text-lg">🔒</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOuvert && produitActif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                Modification de l'article :
              </h2>
              <button onClick={() => setModalOuvert(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom de l'article :
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Poids (Kg) :
                  </label>
                  <input
                    type="number"
                    value={form.poids}
                    onChange={(e) => setForm({ ...form, poids: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                  <select
                    value={form.categorie}
                    onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  >
                    {categoriesDisponibles.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unité d'entrée en dépôt
                  </label>
                  <select
                    value={form.unite}
                    onChange={(e) => setForm({ ...form, unite: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  >
                    {unitesDisponibles.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prix d'Achat Unitaire ($) par {form.unite}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.prixAchat}
                    onChange={(e) => setForm({ ...form, prixAchat: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Seuil</label>
                  <input
                    type="number"
                    value={form.seuil}
                    onChange={(e) => setForm({ ...form, seuil: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="bg-blue-600 text-white p-3 rounded-lg font-bold text-center text-sm">
                Prix de Vente Unitaire en USD : {pvUnitaireUSD.toFixed(2)} / {form.unite}
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Taux (FC)</label>
                  <input
                    type="number"
                    value={form.taux}
                    onChange={(e) => setForm({ ...form, taux: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Marge (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.marge}
                    onChange={(e) => setForm({ ...form, marge: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Arrondi</label>
                  <select
                    value={form.nbreArrondi}
                    onChange={(e) => setForm({ ...form, nbreArrondi: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1 text-sm"
                  >
                    <option value={1}>1</option>
                    <option value={10}>10</option>
                    <option value={100}>100</option>
                    <option value={1000}>1000</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-600 text-white p-3 rounded-lg font-bold text-center text-sm">
                Marge bénéficiaire totale : {margeBenefCDF.toFixed(0)} CDF
              </div>

              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-3">
                  Section livraison aux clients
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nbre de pièces / {form.unite}
                    </label>
                    <input
                      type="number"
                      value={form.piecesParLot}
                      onChange={(e) => setForm({ ...form, piecesParLot: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Lot de Gros
                    </label>
                    <input
                      type="number"
                      value={form.lotGros}
                      onChange={(e) => setForm({ ...form, lotGros: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-blue-600 text-white p-3 rounded-lg">
                    <p className="font-bold text-sm">PV par pièce : {pvParPieceCDF.toFixed(0)} CDF</p>
                    <p className="text-xs">Soit {pvParPieceUSD.toFixed(2)} USD</p>
                  </div>
                  <div className="bg-blue-600 text-white p-3 rounded-lg">
                    <p className="font-bold text-sm">PV au gros : {pvAuGrosCDF.toFixed(0)} CDF</p>
                    <p className="text-xs">Soit {pvAuGrosUSD.toFixed(2)} USD</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-3">
                  Section livraison/sortie dépôt
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sous-Unité de sortie
                    </label>
                    <select
                      value={form.sousUnite}
                      onChange={(e) => setForm({ ...form, sousUnite: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                    >
                      {unitesDisponibles.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nbre de {form.unite}
                    </label>
                    <input
                      type="number"
                      value={form.nbreCartons}
                      onChange={(e) => setForm({ ...form, nbreCartons: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                    />
                  </div>
                </div>

                <div className="bg-blue-600 text-white p-3 rounded-lg">
                  <p className="font-bold text-sm">PV sortie {form.unite} : {pvSortieCDF.toFixed(0)} CDF</p>
                  <p className="text-xs">Soit {pvSortieUSD.toFixed(2)} USD</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={mettreAJour}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
              >
                Mettre à jour le tarif
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}