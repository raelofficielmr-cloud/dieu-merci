import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type ProduitStock } from '../data/stock';
import { entreprise } from '../data/entreprise';

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

export const genererStructurePrixPDF = async (
  produits: ProduitStock[],
  taux: number
) => {
  const doc = new jsPDF();
  let logoBase64: string | undefined;
  try {
    logoBase64 = await chargerLogo();
  } catch (e) {
    console.warn('Logo non chargé :', e);
  }

  // ========== EN-TÊTE ==========
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

  // ========== TITRE ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('STRUCTURE DE PRIX', 105, 48, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | Taux : 1 USD = ${taux} FC`,
    14,
    56
  );

  // ========== GROUPER PAR CATÉGORIE ==========
  // 1. Lister les catégories uniques
  const categories = Array.from(
    new Set(produits.map((p) => p.categorie || 'Divers'))
  ).sort((a, b) => a.localeCompare(b, 'fr'));

  // 2. Préparer les lignes du tableau avec titres de catégorie
  const lignes: any[] = [];
  let compteur = 0;

  categories.forEach((cat) => {
    // Titre de la catégorie (ligne spéciale)
    lignes.push([
      {
        content: cat.toUpperCase(),
        colSpan: 4,
        styles: {
          fillColor: [245, 166, 35], // Doré
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'left',
          fontSize: 11,
        },
      },
    ]);

    // Produits de cette catégorie
    produits
      .filter((p) => (p.categorie || 'Divers') === cat)
      .forEach((p) => {
        compteur++;
        lignes.push([
          compteur.toString(),
          p.nom,
          p.prixUnitaire === 0 ? '0' : (p.prixUnitaire * taux).toFixed(0),
          p.prixVenteLot === 0 ? '0' : (p.prixVenteLot * taux).toFixed(0),
        ]);
      });
  });

  // ========== TABLEAU ==========
  autoTable(doc, {
    startY: 62,
    head: [['N°', 'NOM DU PRODUIT', 'P.V UNITAIRE (FC)', 'P.V GROS / DOUZAINE (FC)']],
    body: lignes,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 26, 26],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left' },
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // ========== PIED DE PAGE ==========
  const finalY = (doc as any).lastAutoTable.finalY || 62;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Total : ${produits.length} produit(s) dans ${categories.length} catégorie(s)`,
    14,
    finalY + 10
  );

  doc.save(`structure-prix-${new Date().toISOString().split('T')[0]}.pdf`);
};