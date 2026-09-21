import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useTaux } from '../context/TauxContext';
import { useSuccursales } from '../context/SuccursalesContext';
import { useAuth } from '../context/AuthContext';
import { produitsInitiaux, type ProduitStock } from '../data/stock';
import { type LigneLivraison } from '../data/livraisons';
import { genererBonLivraisonPDF } from '../utils/pdfLivraison';

export default function SuiviCredit() {
  const { taux } = useTaux();
  const { succursales, setSuccursales } = useSuccursales();
  const { role } = useAuth();

  const [succursaleChoisie, setSuccursaleChoisie] = useState(succursales[0]?.nom || '');
  const [dateLivraison, setDateLivraison] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [recherche, setRecherche] = useState('');
  const [panier, setPanier] = useState<LigneLivraison[]>([]);

  // Modal ajout produit
  const [modalOuvert, setModalOuvert] = useState(false);
  const [produitActif, setProduitActif] = useState<ProduitStock | null>(null);
  const [formAjout, setFormAjout] = useState({
    quantite: 0,
    unite: 'Pièces',
  });

  // Filtre produits
  const produitsFiltres = produitsInitiaux.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  // Ouvrir modal pour un produit
  const ouvrirModal = (p: ProduitStock) => {
    setProduitActif(p);
    setFormAjout({ quantite: 0, unite: p.unite });
    setModalOuvert(true);
  };

  // Ajouter au panier
  const ajouterAuPanier = () => {
    if (!produitActif) return;
    if (formAjout.quantite <= 0) return alert('Entrez une quantité');

    const prixUnitaire = produitActif.prixUnitaire || 0;
    const total = formAjout.quantite * prixUnitaire;

    const nouvelleLigne: LigneLivraison = {
      produitId: produitActif.id,
      nom: produitActif.nom,
      quantite: formAjout.quantite,
      unite: formAjout.unite,
      prixUnitaire,
      total,
    };

    setPanier([...panier, nouvelleLigne]);
    setModalOuvert(false);
    setProduitActif(null);
  };

  // Supprimer une ligne du panier
  const supprimerLigne = (index: number) => {
    if (confirm('Retirer ce produit du panier ?')) {
      setPanier(panier.filter((_, i) => i !== index));
    }
  };

  // Total du panier
  const totalPanierUSD = panier.reduce((acc, l) => acc + l.total, 0);
  const totalPanierCDF = totalPanierUSD * taux;

  // Valider la livraison
  const validerLivraison = () => {
    if (panier.length === 0) return alert('Le panier est vide');
    if (!succursaleChoisie) return alert('Choisissez une succursale');

    const numero = `BL-${Date.now().toString().slice(-6)}`;

    // 1. Mettre à jour la dette de la succursale
    setSuccursales(
      succursales.map((s) =>
        s.nom === succursaleChoisie
          ? { ...s, detteActuelle: s.detteActuelle + totalPanierUSD }
          : s
      )
    );

    // 2. Générer le PDF
    genererBonLivraisonPDF(numero, succursaleChoisie, dateLivraison, panier, totalPanierUSD, totalPanierCDF, taux);

    // 3. Message de confirmation
    alert(`✅ Livraison ${numero} validée !\n\nDette de ${succursaleChoisie} : + ${totalPanierUSD.toFixed(2)} USD`);

    // 4. Vider le panier
    setPanier([]);
  };

  // Formater date
  const formaterDate = (date: string) => {
    const [y, m, d] = date.split('-');
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const dateObj = new Date(date);
    return `${jours[dateObj.getDay()]} ${parseInt(d)} ${['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'][parseInt(m)-1]} ${y}`;
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Nouvelle Livraison
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Composer un bon de livraison
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========== PANIER (GAUCHE) ========== */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          {/* Sélection succursale + date */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                🛒 Bon de livraison à
              </label>
              <select
                value={succursaleChoisie}
                onChange={(e) => setSuccursaleChoisie(e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-bold rounded-lg bg-white dark:bg-gray-700"
              >
                {succursales.map((s) => (
                  <option key={s.id} value={s.nom}>{s.nom.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 text-right mb-1">
                {formaterDate(dateLivraison)}
              </p>
              <input
                type="date"
                value={dateLivraison}
                onChange={(e) => setDateLivraison(e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-bold rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700 my-4" />

          {/* Panier */}
          {panier.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl opacity-20 mb-2">🛒</div>
              <p className="text-gray-400 dark:text-gray-500">Le panier est vide</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {panier.map((l, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 dark:text-white truncate">
                      {l.nom}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {l.quantite} {l.unite} × {l.prixUnitaire.toFixed(2)} USD
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <p className="font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                      ${l.total.toFixed(2)}
                    </p>
                    <button
                      onClick={() => supprimerLigne(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {/* Totaux */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total USD</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ${totalPanierUSD.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total CDF</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {totalPanierCDF.toLocaleString()} CDF
                  </span>
                </div>
              </div>

              <button
                onClick={validerLivraison}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4"
              >
                ✅ Valider la livraison
              </button>
            </div>
          )}
        </div>

        {/* ========== LISTE PRODUITS (DROITE) ========== */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mb-4"
          />

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {produitsFiltres.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 dark:text-white truncate">
                    {p.nom}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Stock: {p.quantite} {p.unite}
                  </p>
                </div>
                <button
                  onClick={() => ouvrirModal(p)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-2"
                >
                  +
                </button>
              </div>
            ))}
            {produitsFiltres.length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucun produit trouvé</p>
            )}
          </div>
        </div>
      </div>

      {/* ========== MODAL LIVRAISON ARTICLE ========== */}
      {modalOuvert && produitActif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Livraison de l'article
              </h2>
              <button
                onClick={() => setModalOuvert(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                {produitActif.nom}
              </p>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Quantité de {formAjout.unite} à livrer
                </label>
                <input
                  type="number"
                  value={formAjout.quantite || ''}
                  onChange={(e) =>
                    setFormAjout({ ...formAjout, quantite: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1 text-lg"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                  Maximum disponible : {produitActif.quantite} {produitActif.unite}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Unité de livraison
                </label>
                <select
                  value={formAjout.unite}
                  onChange={(e) => setFormAjout({ ...formAjout, unite: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mt-1"
                >
                  <option value={produitActif.unite}>{produitActif.unite}</option>
                  {produitActif.sousUnite && produitActif.sousUnite !== produitActif.unite && (
                    <option value={produitActif.sousUnite}>{produitActif.sousUnite}</option>
                  )}
                </select>
              </div>

              {produitActif.prixUnitaire > 0 && formAjout.quantite > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {(formAjout.quantite * produitActif.prixUnitaire).toFixed(2)} USD
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={ajouterAuPanier}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}