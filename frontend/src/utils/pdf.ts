import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type ProduitStock } from '../data/stock';
import { type ActiviteHistorique } from '../data/historique';
import { entreprise } from '../data/entreprise';

// ========== CHARGER LE LOGO EN BASE64 ==========
const chargerLogo = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/logoets.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas error');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject('Logo introuvable');
  });
};

// ========== EN-TÊTE STANDARD ==========
const ajouterEntete = (doc: jsPDF, titre: string, logoBase64?: string) => {
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
    } catch (e) {
      console.warn('Erreur logo :', e);
    }
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(entreprise.nom, 196, 15, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Adresse : ${entreprise.adresse}`, 196, 21, { align: 'right' });
  doc.text(`Téléphone : ${entreprise.telephone}`, 196, 26, { align: 'right' });

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 38, 196, 38);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(titre, 105, 48, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    14,
    56
  );

  return 62;
};

// ========== TYPES ==========
export interface Mouvement {
  date: string;
  produit: string;
  type: 'Entrée' | 'Sortie';
  quantite: number;
  unite: string;
  utilisateur: string;
}

// ========== JOURNAL DU JOUR ==========
export const genererJournalPDF = async (
  date: string,
  mouvements: Mouvement[],
  produits: ProduitStock[]
) => {
  const doc = new jsPDF('landscape');
  let logoBase64: string | undefined;
  try {
    logoBase64 = await chargerLogo();
  } catch (e) {
    console.warn('Logo non chargé :', e);
  }

  const dateFormatee = new Date(date).toLocaleDateString('fr-FR');
  const y = ajouterEntete(doc, `MOUVEMENT DU STOCK : ${dateFormatee}`, logoBase64);

  const produitsConcernes = Array.from(new Set(mouvements.map((m) => m.produit)));

  if (produitsConcernes.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text('Aucun mouvement pour cette date.', 148, y + 20, { align: 'center' });
    doc.save(`journal-${date}.pdf`);
    return;
  }

  const lignes = produitsConcernes.map((nomProduit, index) => {
    const produit = produits.find((p) => p.nom === nomProduit);
    const mouvementsProduit = mouvements.filter((m) => m.produit === nomProduit);
    const entrees = mouvementsProduit
      .filter((m) => m.type === 'Entrée')
      .reduce((a, m) => a + m.quantite, 0);
    const sorties = mouvementsProduit
      .filter((m) => m.type === 'Sortie')
      .reduce((a, m) => a + m.quantite, 0);
    const stockFinal = produit?.quantite || 0;
    const stockInitial = stockFinal - entrees + sorties;
    const unite = produit?.unite || '';
    return [
      (index + 1).toString(),
      nomProduit,
      `${stockInitial} ${unite}`,
      entrees > 0 ? `${entrees} ${unite}` : '−',
      sorties > 0 ? `${sorties} ${unite}` : '−',
      `${stockFinal} ${unite}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['N°', 'ARTICLE', 'STOCK INITIAL', 'ENTRÉES', 'SORTIES', 'STOCK FINAL']],
    body: lignes,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: { fontSize: 10, halign: 'center' },
    columnStyles: {
      1: { halign: 'left', fontStyle: 'bold' },
      3: { textColor: [40, 130, 40] },
      4: { textColor: [200, 40, 40] },
    },
  });

  doc.save(`journal-${date}.pdf`);
};

// ========== INVENTAIRE COMPLET ==========
export const genererInventairePDF = async (produits: ProduitStock[]) => {
  const doc = new jsPDF();
  let logoBase64: string | undefined;
  try {
    logoBase64 = await chargerLogo();
  } catch (e) {
    console.warn('Logo non chargé :', e);
  }

  const y = ajouterEntete(doc, 'INVENTAIRE COMPLET', logoBase64);

  autoTable(doc, {
    startY: y,
    head: [['N°', 'Produit', 'Catégorie', 'Poids', 'Quantité', 'P.U (USD)', 'Total (USD)']],
    body: produits.map((p, i) => [
      (i + 1).toString(),
      p.nom,
      p.categorie,
      `${p.poids} Kg`,
      `${p.quantite} ${p.unite}`,
      p.prixUnitaire.toFixed(2),
      (p.quantite * p.prixUnitaire).toFixed(2),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [139, 26, 26], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  const total = produits.reduce((a, p) => a + p.quantite * p.prixUnitaire, 0);
  const finalY = (doc as any).lastAutoTable.finalY || y + 20;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL GÉNÉRAL : $${total.toFixed(2)}`, 196, finalY + 10, { align: 'right' });

  doc.save(`inventaire-${new Date().toISOString().split('T')[0]}.pdf`);
};

// ========== FICHE PRODUIT ==========
export const genererFicheProduitPDF = async (produit: ProduitStock) => {
  const doc = new jsPDF();
  let logoBase64: string | undefined;
  try {
    logoBase64 = await chargerLogo();
  } catch (e) {
    console.warn('Logo non chargé :', e);
  }

  const y = ajouterEntete(doc, 'FICHE PRODUIT', logoBase64);

  autoTable(doc, {
    startY: y,
    head: [['Champ', 'Valeur']],
    body: [
      ['Nom', produit.nom],
      ['Catégorie', produit.categorie],
      ['Description', produit.description || '—'],
      ['Poids', `${produit.poids} Kg`],
      ['Quantité en stock', `${produit.quantite} ${produit.unite}`],
      ['Prix unitaire', `$${produit.prixUnitaire.toFixed(2)}`],
      ['Valeur totale', `$${(produit.quantite * produit.prixUnitaire).toFixed(2)}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [139, 26, 26], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 11 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  doc.save(`fiche-${produit.nom.replace(/\s+/g, '-')}.pdf`);
};

// ========== HISTORIQUE ==========
export const genererHistoriquePDF = async (
  activites: ActiviteHistorique[],
  typeFiltre: string,
  valeurTotale: number,
  totalCredits: number
) => {
  const doc = new jsPDF('landscape');
  let logoBase64: string | undefined;
  try {
    logoBase64 = await chargerLogo();
  } catch (e) {
    console.warn('Logo non chargé :', e);
  }

  // En-tête
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
    } catch (e) {}
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(entreprise.nom, 196, 15, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Adresse : ${entreprise.adresse}`, 196, 21, { align: 'right' });
  doc.text(`Téléphone : ${entreprise.telephone}`, 196, 26, { align: 'right' });

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 38, 196, 38);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`HISTORIQUE — ${typeFiltre.toUpperCase()}`, 105, 48, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    14,
    56
  );

  // Totaux
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Valeur totale : ${valeurTotale.toFixed(2)} USD`, 14, 62);
  doc.text(`Total crédits : ${totalCredits.toFixed(2)} USD`, 100, 62);

  // Formater la date
  const formaterDate = (date: string) => {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };

  // Tableau selon le type
  if (typeFiltre === 'Approvisionnement') {
    autoTable(doc, {
      startY: 70,
      head: [['DATE', 'PRODUIT', 'QUANTITÉ']],
      body: activites.map((a) => [
        formaterDate(a.date),
        a.produit || '',
        `${a.quantite} ${a.unite || ''}`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 26, 26], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
    });
  } else {
    autoTable(doc, {
      startY: 70,
      head: [['DATE', 'SUCCURSALE', 'MONTANT (USD)']],
      body: activites.map((a) => [
        formaterDate(a.date),
        a.succursale || '',
        (a.montant || 0).toFixed(2),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 26, 26], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
    });
  }

  doc.save(`historique-${typeFiltre.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
};