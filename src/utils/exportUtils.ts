import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { Group, Expense, User, Balance } from '../types';
import { calculateBalances } from './balanceCalculator';

export interface ExportData {
  group: Group;
  expenses: Expense[];
  users: User[];
  balances: Balance[];
}

export const exportToPDF = (data: ExportData): void => {
  const { group, expenses, users, balances } = data;
  const doc = new jsPDF();

  // Titre principal
  doc.setFontSize(20);
  doc.text(`Rapport - ${group.name}`, 20, 20);

  // Informations du groupe
  doc.setFontSize(12);
  doc.text(`Description: ${group.description || 'Aucune description'}`, 20, 35);
  doc.text(`Membres: ${group.members.map(m => m.name).join(', ')}`, 20, 45);
  doc.text(`Date de création: ${group.createdAt.toLocaleDateString('fr-FR')}`, 20, 55);

  // Tableau des dépenses
  doc.setFontSize(16);
  doc.text('Dépenses', 20, 75);

  const expenseData = expenses.map(expense => {
    const payer = users.find(u => u.id === expense.paidBy)?.name || 'Utilisateur inconnu';
    const payees = expense.paidFor
      .map(id => users.find(u => u.id === id)?.name || 'Utilisateur inconnu')
      .join(', ');
    
    return [
      expense.description,
      `${expense.amount.toFixed(2)} €`,
      expense.category || 'Non catégorisé',
      expense.date.toLocaleDateString('fr-FR'),
      payer,
      payees
    ];
  });

  autoTable(doc, {
    head: [['Description', 'Montant', 'Catégorie', 'Date', 'Payé par', 'Pour']],
    body: expenseData,
    startY: 80,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255
    }
  });

  // Tableau des soldes
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(16);
  doc.text('Soldes des membres', 20, currentY);

  const balanceData = balances.map(balance => [
    balance.userName,
    `${balance.balance.toFixed(2)} €`,
    balance.balance > 0 ? 'Est dû' : balance.balance < 0 ? 'Doit' : 'Équilibré'
  ]);

  autoTable(doc, {
    head: [['Membre', 'Solde', 'Statut']],
    body: balanceData,
    startY: currentY + 5,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255
    }
  });

  // Résumé
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total des dépenses: ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)} €`, 20, finalY);
  doc.text(`Nombre de dépenses: ${expenses.length}`, 20, finalY + 10);
  doc.text(`Nombre de membres: ${users.length}`, 20, finalY + 20);

  // Date d'export
  doc.setFontSize(10);
  doc.text(`Exporté le: ${new Date().toLocaleString('fr-FR')}`, 20, finalY + 35);

  // Sauvegarder le PDF
  doc.save(`${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_rapport.pdf`);
};

export const exportToCSV = (data: ExportData): void => {
  const { group, expenses, users, balances } = data;

  // Données des dépenses
  const expenseData = expenses.map(expense => {
    const payer = users.find(u => u.id === expense.paidBy)?.name || 'Utilisateur inconnu';
    const payees = expense.paidFor
      .map(id => users.find(u => u.id === id)?.name || 'Utilisateur inconnu')
      .join(', ');
    
    return {
      description: expense.description,
      montant: expense.amount,
      categorie: expense.category || 'Non catégorisé',
      date: expense.date.toLocaleDateString('fr-FR'),
      paye_par: payer,
      pour: payees
    };
  });

  // Données des soldes
  const balanceData = balances.map(balance => ({
    membre: balance.userName,
    solde: balance.balance,
    statut: balance.balance > 0 ? 'Est dû' : balance.balance < 0 ? 'Doit' : 'Équilibré'
  }));

  // Informations du groupe
  const groupInfo = [{
    nom_groupe: group.name,
    description: group.description || 'Aucune description',
    membres: group.members.map(m => m.name).join(', '),
    date_creation: group.createdAt.toLocaleDateString('fr-FR'),
    total_depenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    nombre_depenses: expenses.length,
    nombre_membres: users.length
  }];

  // Créer les fichiers CSV
  const expenseCSV = Papa.unparse(expenseData);
  const balanceCSV = Papa.unparse(balanceData);
  const groupCSV = Papa.unparse(groupInfo);

  // Sauvegarder les fichiers
  const blob = new Blob([expenseCSV], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_depenses.csv`);

  const balanceBlob = new Blob([balanceCSV], { type: 'text/csv;charset=utf-8;' });
  saveAs(balanceBlob, `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_soldes.csv`);

  const groupBlob = new Blob([groupCSV], { type: 'text/csv;charset=utf-8;' });
  saveAs(groupBlob, `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_resume.csv`);
};

export const exportGroupData = (group: Group, expenses: Expense[], users: User[]): void => {
  const balances = calculateBalances(expenses, users);
  const exportData: ExportData = { group, expenses, users, balances };
  
  exportToPDF(exportData);
  exportToCSV(exportData);
}; 