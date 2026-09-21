import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useTaux } from '../context/TauxContext';
import { produitService, type Produit } from '../services/produitService';
import { succursaleService, type Succursale } from '../services/succursaleService';
import { versementService } from '../services/versementService';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

const COULEURS_CATEGORIES: Record<string, string> = {
  Alimentation: '#3B82F6',
  Construction: '#EC4899',
  Cosmétique: '#FCD34D',
  Divers: '#1F2937',
  'Pièces Moto': '#E5E7EB',
  'Pièces Vélo': '#16A34A',
};

export default function Dashboard() {
  const { taux } = useTaux();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [succursales, setSuccursales] = useState<Succursale[]>([]);
  const [versements, setVersements] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modalValeurOuvert, setModalValeurOuvert] = useState(false);

  // Charger les données
  useEffect(() => {
    const charger = async () => {
      try {
        const [p, s, v] = await Promise.all([
          produitService.getAll(),
          succursaleService.getAll(),
          versementService.getAll(),
        ]);
        setProduits(p);
        setSuccursales(s);
        setVersements(v);
      } catch (error) {
        console.error(error);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  // Nombre de produits
  const totalArticles = produits.length;

  // Valeur du stock
  const valeurStockUSD = produits.reduce(
    (acc, p) => acc + p.quantite * p.prixUnitaire,
    0
  );

  // Volume par catégorie
  const volumeParCategorie = Object.keys(COULEURS_CATEGORIES).map((cat) => ({
    name: cat,
    value: produits
      .filter((p) => p.categorie === cat)
      .reduce((acc, p) => acc + p.quantite, 0),
    color: COULEURS_CATEGORIES[cat],
  }));

  const volumeFiltre = volumeParCategorie.filter((v) => v.value > 0);

  // Tranches de marges
  const tranchesMarges = [
    { tranche: '0-5 %', count: 0 },
    { tranche: '6-10 %', count: 0 },
    { tranche: '11-15 %', count: 0 },
    { tranche: '16+ %', count: 0 },
  ];

  produits.forEach((p) => {
    const marge = p.marge || 0;
    if (marge <= 5) tranchesMarges[0].count++;
    else if (marge <= 10) tranchesMarges[1].count++;
    else if (marge <= 15) tranchesMarges[2].count++;
    else tranchesMarges[3].count++;
  });

  // Statistique des versements par succursale
  const statsVersements = succursales
    .map((s) => {
      const totalUSD = versements
        .filter((v) => v.succursaleId === s._id)
        .reduce((acc, v) => acc + v.verseUSD + v.verseCDF / v.taux, 0);
      return { nom: s.nom, total: totalUSD };
    })
    .sort((a, b) => b.total - a.total);

  const maxVersement = Math.max(...statsVersements.map((s) => s.total), 1);

  // Répartition des dettes
  const repartitionDettes = succursales.map((s) => ({
    nom: s.nom,
    dette: Math.abs(s.detteActuelle),
  }));

  if (chargement) {
    return (
      <Layout>
        <p className="text-center py-12 text-gray-500">Chargement du tableau de bord...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 3 CARTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-800 text-white rounded-lg p-6 relative overflow-hidden">
          <p className="text-sm opacity-90">Taux du jour</p>
          <p className="text-xs opacity-70 mb-2">(CDF)</p>
          <p className="text-4xl font-bold">{taux}</p>
          <span className="absolute right-4 bottom-4 text-6xl opacity-20">$</span>
        </div>

        <div className="bg-blue-600 text-white rounded-lg p-6 relative overflow-hidden">
          <p className="text-sm opacity-90">Stock Central</p>
          <p className="text-4xl font-bold mt-2">{totalArticles.toLocaleString()}</p>
          <p className="text-lg font-medium">articles</p>
          <span className="absolute right-4 bottom-4 text-6xl opacity-20">📦</span>
        </div>

        <button
          onClick={() => setModalValeurOuvert(true)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors"
        >
          <div className="bg-blue-600 px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow-lg">
            <span>👁️</span>
            <span>Voir la valeur du stock et crédits</span>
          </div>
          <span className="absolute right-4 bottom-4 text-6xl opacity-10">👁️</span>
        </button>
      </div>

      {/* GRAPHIQUES CÔTE À CÔTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Camembert */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-4">
            VOLUME PAR CATÉGORIE DES ARTICLES
          </h2>

          {volumeFiltre.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Aucun article</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={volumeFiltre}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {volumeFiltre.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} articles`} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {volumeFiltre.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {volumeFiltre.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] text-gray-600 dark:text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Marges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-4">
            TRANCHES DE MARGES BÉNÉFICIAIRES
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={tranchesMarges}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="tranche" type="category" width={70} />
              <Tooltip formatter={(value) => `${value} produit(s)`} />
              <Bar dataKey="count" fill="#F5A623" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STATISTIQUE VERSEMENTS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
          📊 Statistique des versements mensuels
        </h2>

        {statsVersements.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucune succursale</p>
        ) : (
          <div className="space-y-4">
            {statsVersements.map((s) => {
              const pourcentage = (s.total / maxVersement) * 100;
              return (
                <div key={s.nom}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {s.nom}
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                      {s.total.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${pourcentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RÉPARTITION DETTES */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
          Répartition des dettes par succursale
        </h2>

        {repartitionDettes.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucune succursale</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={repartitionDettes} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="nom"
                angle={-30}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} USD`} />
              <Bar dataKey="dette" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* MODAL VALEUR */}
      {modalValeurOuvert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Valeur du stock
              </h2>
              <button
                onClick={() => setModalValeurOuvert(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Valeur totale du stock</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${valeurStockUSD.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ≈ {(valeurStockUSD * taux).toLocaleString()} CDF
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Dettes des succursales
                </p>
                <div className="space-y-2">
                  {succursales.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between bg-white dark:bg-gray-700 rounded p-2 text-sm"
                    >
                      <p className="font-medium text-gray-800 dark:text-white">{s.nom}</p>
                      <p className="font-bold text-orange-600 dark:text-orange-400">
                        ${s.detteActuelle.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {succursales.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">Aucune succursale</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setModalValeurOuvert(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}