import React from 'react';
import { Group, Expense, User } from '../types';
import { exportGroupData } from '../utils/exportUtils';
import { notify } from '../hooks/notify';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  expenses: Expense[];
  users: User[];
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  group,
  expenses,
  users
}) => {
  if (!isOpen) return null;

  const handleExportPDF = () => {
    try {
      const balances = expenses.reduce((acc, expense) => {
        // Calculer les soldes pour l'export PDF
        const payer = users.find(u => u.id === expense.paidBy);
        if (payer) {
          acc[payer.id] = (acc[payer.id] || 0) + expense.amount;
        }
        
        expense.paidFor.forEach(userId => {
          const user = users.find(u => u.id === userId);
          if (user) {
            acc[user.id] = (acc[user.id] || 0) - expense.amount / expense.paidFor.length;
          }
        });
        return acc;
      }, {} as Record<string, number>);

      const balanceData = Object.entries(balances).map(([userId, balance]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          userName: user?.name || 'Utilisateur inconnu',
          balance
        };
      });

      const exportData = {
        group,
        expenses,
        users,
        balances: balanceData
      };

      // Import dynamique pour éviter les problèmes de SSR
      import('../utils/exportUtils').then(({ exportToPDF }) => {
        exportToPDF(exportData);
        notify({
          title: 'Export PDF',
          description: 'Le PDF a été généré et téléchargé avec succès.',
          status: 'success',
        });
      }).catch((error) => {
        console.error('Erreur lors de l\'export PDF:', error);
        notify({
          title: 'Erreur',
          description: 'Erreur lors de l\'export PDF',
          status: 'error',
        });
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      notify({
        title: 'Erreur',
        description: 'Erreur lors de l\'export PDF',
        status: 'error',
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const balances = expenses.reduce((acc, expense) => {
        // Calculer les soldes pour l'export CSV
        const payer = users.find(u => u.id === expense.paidBy);
        if (payer) {
          acc[payer.id] = (acc[payer.id] || 0) + expense.amount;
        }
        
        expense.paidFor.forEach(userId => {
          const user = users.find(u => u.id === userId);
          if (user) {
            acc[user.id] = (acc[user.id] || 0) - expense.amount / expense.paidFor.length;
          }
        });
        return acc;
      }, {} as Record<string, number>);

      const balanceData = Object.entries(balances).map(([userId, balance]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          userName: user?.name || 'Utilisateur inconnu',
          balance
        };
      });

      const exportData = {
        group,
        expenses,
        users,
        balances: balanceData
      };

      // Import dynamique pour éviter les problèmes de SSR
      import('../utils/exportUtils').then(({ exportToCSV }) => {
        exportToCSV(exportData);
        notify({
          title: 'Export CSV',
          description: 'Les fichiers CSV ont été générés et téléchargés avec succès.',
          status: 'success',
        });
      }).catch((error) => {
        console.error('Erreur lors de l\'export CSV:', error);
        notify({
          title: 'Erreur',
          description: 'Erreur lors de l\'export CSV',
          status: 'error',
        });
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      notify({
        title: 'Erreur',
        description: 'Erreur lors de l\'export CSV',
        status: 'error',
      });
    }
  };

  const handleExportAll = () => {
    try {
      exportGroupData(group, expenses, users);
      notify({
        title: 'Export complet',
        description: 'Le PDF et les fichiers CSV ont été générés et téléchargés avec succès.',
        status: 'success',
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      notify({
        title: 'Erreur',
        description: 'Erreur lors de l\'export complet',
        status: 'error',
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Exporter les données</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          <div className="export-summary">
            <h3>Résumé du groupe</h3>
            <p><strong>Groupe:</strong> {group.name}</p>
            <p><strong>Membres:</strong> {users.length}</p>
            <p><strong>Dépenses:</strong> {expenses.length}</p>
            <p><strong>Total:</strong> {totalExpenses.toFixed(2)} €</p>
          </div>

          <div className="export-options">
            <h3>Options d'export</h3>
            
            <div className="export-option">
              <h4>📄 Export PDF</h4>
              <p>Génère un rapport PDF complet avec toutes les dépenses et soldes</p>
              <button className="btn btn-primary" onClick={handleExportPDF}>
                Exporter en PDF
              </button>
            </div>

            <div className="export-option">
              <h4>📊 Export CSV</h4>
              <p>Génère des fichiers CSV séparés pour les dépenses, soldes et résumé</p>
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                Exporter en CSV
              </button>
            </div>

            <div className="export-option">
              <h4>📦 Export complet</h4>
              <p>Génère à la fois le PDF et les fichiers CSV</p>
              <button className="btn btn-success" onClick={handleExportAll}>
                Exporter tout
              </button>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 