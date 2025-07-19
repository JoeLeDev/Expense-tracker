import React, { useState } from 'react';
import { useGroup } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import { calculateBalances, formatCurrency, getTotalExpenses } from '../utils/balanceCalculator';
import ExpenseList from './ExpenseList';
import CreateExpenseModal from './CreateExpenseModal';
import BalanceSummary from './BalanceSummary';

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const [isCreateExpenseModalOpen, setIsCreateExpenseModalOpen] = useState(false);
  const { data: group, isLoading: groupLoading, error: groupError } = useGroup(groupId);
  const { data: expenses = [], isLoading: expensesLoading, error: expensesError } = useExpenses(groupId);

  const handleCreateExpense = () => {
    setIsCreateExpenseModalOpen(true);
  };

  const handleExpenseCreated = () => {
    setIsCreateExpenseModalOpen(false);
    alert('Dépense ajoutée avec succès !');
  };

  if (groupLoading || expensesLoading) {
    return (
      <div className="loading">
        <p>Chargement...</p>
      </div>
    );
  }

  if (groupError || expensesError || !group) {
    return (
      <div className="error">
        <h2>Erreur</h2>
        <p>Impossible de charger les détails du groupe.</p>
        <button className="btn btn-primary" onClick={onBack}>
          Retour
        </button>
      </div>
    );
  }

  const balances = calculateBalances(expenses, group.members);
  const totalExpenses = getTotalExpenses(expenses);

  return (
    <div className="group-detail">
      {/* Group Header */}
      <div className="group-header">
        <div className="group-info">
          <h2 className="group-title">{group.name}</h2>
          {group.description && (
            <p className="group-description">{group.description}</p>
          )}
          <div className="group-stats">
            <span className="stat">
              {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
            </span>
            <span className="stat">
              Total: {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCreateExpense}>
          + Ajouter une dépense
        </button>
      </div>

      {/* Balance Summary */}
      <BalanceSummary balances={balances} />

      {/* Expenses List */}
      <div className="expenses-section">
        <h3>Dépenses récentes</h3>
        <ExpenseList 
          expenses={expenses} 
          groupMembers={group.members}
        />
      </div>

      {/* Create Expense Modal */}
      <CreateExpenseModal
        isOpen={isCreateExpenseModalOpen}
        onClose={() => setIsCreateExpenseModalOpen(false)}
        onSuccess={handleExpenseCreated}
        groupId={groupId}
        groupMembers={group.members}
      />
    </div>
  );
};

export default GroupDetail; 