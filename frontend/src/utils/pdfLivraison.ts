import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type LigneLivraison } from '../data/livraisons';
import { entreprise } from '../data/entreprise';

const chargerLogo = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/logo.png';
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

export const genererBonLivraisonPDF = async (
  numero: string,
  succursale: string,
  date: string,
  lignes: LigneLivraison[],
  totalUSD: number,
  totalCDF: number,
  taux: number
) => {
  const doc = new jsPDF();
  let logoBase64: string | undefined;
  try {
    logoBase64 = await chargerLogo();
  } catch (e) {}

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

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`BON DE LIVRAISON ${numero}`, 105, 48, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Succursale : ${succursale}`, 14, 60);
  doc.text(`Date : ${new Date(date).toLocaleDateString('fr-FR')}`, 14, 67);
  doc.text(`Taux : 1 USD = ${taux} FC`, 14, 74);

  autoTable(doc, {
    startY: 82,
    head: [['N°', 'Produit', 'Quantité', 'P.U (USD)', 'Total (USD)']],
    body: lignes.map((l, i) => [
      (i + 1).toString(),
      l.nom,
      `${l.quantite} ${l.unite}`,
      l.prixUnitaire.toFixed(2),
      l.total.toFixed(2),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [139, 26, 26], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL USD : $${totalUSD.toFixed(2)}`, 196, finalY + 10, { align: 'right' });
  doc.text(`TOTAL CDF : ${totalCDF.toLocaleString()} FC`, 196, finalY + 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature Livreur : _______________', 14, finalY + 40);
  doc.text('Signature Receveur : _______________', 120, finalY + 40);

  doc.save(`bon-livraison-${numero}.pdf`);
};