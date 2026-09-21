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

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
    } catch (e) {}
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
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
  doc.text('STRUCTURE DE PRIX', 105, 48, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | Taux : 1 USD = ${taux} FC`,
    14,
    56
  );

  autoTable(doc, {
    startY: 62,
    head: [['N°', 'PRODUIT', 'POIDS', 'P.V UNIT (FC)', 'P.V LOT (FC)', 'MARGE BÉN. (FC)']],
    body: produits.map((p, i) => [
      (i + 1).toString(),
      p.nom,
      `${p.poids} Kg`,
      p.prixUnitaire === 0 ? '0' : (p.prixUnitaire * taux).toFixed(0),
      p.prixUnitaire === 0 ? '0' : (p.prixVenteLot * taux).toFixed(0),
      `+ ${(p.prixUnitaire * p.marge / 100 * taux).toFixed(0)}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [139, 26, 26], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  doc.save(`structure-prix-${new Date().toISOString().split('T')[0]}.pdf`);
};