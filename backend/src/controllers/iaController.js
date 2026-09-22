import { GoogleGenAI } from '@google/genai';
import Produit from '../models/Produit.js';
import Succursale from '../models/Succursale.js';
import Versement from '../models/Versement.js';
import Parametre from '../models/Parametre.js';

// Initialisation avec le nouveau SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getContexte = async () => {
  const [produits, succursales, versements, parametres] = await Promise.all([
    Produit.find(),
    Succursale.find(),
    Versement.find().sort({ date: -1 }).limit(30),
    Parametre.findOne(),
  ]);

  const produitsTexte = produits
    .map(
      (p) =>
        `- ${p.nom} | Catégorie: ${p.categorie} | Quantité: ${p.quantite} ${p.unite} | Prix vente: ${p.prixUnitaire} USD | Seuil: ${p.seuilAlerte}`
    )
    .join('\n');

  const succursalesTexte = succursales
    .map((s) => `- ${s.nom} | Adresse: ${s.adresse} | Dette: ${s.detteActuelle} USD`)
    .join('\n');

  const versementsTexte = versements
    .map(
      (v) =>
        `- ${v.date.toLocaleDateString('fr-FR')} | ${v.succursaleNom} | ${v.verseUSD} USD + ${v.verseCDF} FC | Reste: ${v.reste} USD`
    )
    .join('\n');

  const taux = parametres?.tauxDuJour || 2350;
  const valeurStock = produits.reduce((acc, p) => acc + p.quantite * p.prixUnitaire, 0);

  return `
CONTEXTE DE L'ENTREPRISE ETS DIEU MERCI :
Taux du jour : 1 USD = ${taux} FC
Valeur totale du stock : ${valeurStock.toFixed(2)} USD
Nombre de produits : ${produits.length}
Nombre de succursales : ${succursales.length}

PRODUITS EN STOCK :
${produitsTexte || 'Aucun produit'}

SUCCURSALES :
${succursalesTexte || 'Aucune succursale'}

DERNIERS VERSEMENTS (30 derniers) :
${versementsTexte || 'Aucun versement'}
`;
};

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message requis' });
    }

    const contexte = await getContexte();

    // Nouvelle syntaxe du SDK @google/genai
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: `Tu es un assistant IA pour Ets DIEU MERCI, une entreprise de quincaillerie à Kinshasa.
Tu aides Papa (le propriétaire) à gérer son entreprise.

RÈGLES :
- Réponds TOUJOURS en français
- Sois CONCIS (2-4 phrases max)
- Utilise les données du CONTEXTE fourni
- Si la question n'a pas de rapport avec l'entreprise, dis poliment que tu ne peux pas répondre
- Ne JAMAIS inventer de chiffres
- Si tu ne sais pas, dis "Je n'ai pas cette information"

${contexte}`,
      },
    });

    res.json({ reponse: response.text });
  } catch (error) {
    console.error('Erreur chat IA :', error);
    res.status(500).json({ message: 'Erreur lors de la réponse IA' });
  }
}