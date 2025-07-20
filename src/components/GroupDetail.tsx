import React, { useState } from 'react';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseList from './ExpenseList';
import CreateExpenseModal from './CreateExpenseModal';
import EditExpenseModal from './EditExpenseModal';
import BalanceSummary from './BalanceSummary';
import ExportModal from './ExportModal';
import { Expense } from '../types';
import { calculateBalances } from '../utils/balanceCalculator';

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [expensePage, setExpensePage] = useState(1);
  const EXPENSES_PER_PAGE = 5;
  
  const { data: groups = [] } = useGroups();
  const { data: expenses = [] } = useExpenses(groupId);
  
  const group = groups.find(g => g.id === groupId);
  const groupExpenses = expenses.filter(expense => expense.groupId === groupId);

  if (!group) {
    return (
      <div className="error">
        <h2>Groupe non trouvé</h2>
        <button className="btn btn-primary" onClick={onBack}>
          Retour aux groupes
        </button>
      </div>
    );
  }

  const handleCreateExpense = () => {
    setIsCreateModalOpen(true);
  };

  const handleExpenseCreated = () => {
    setIsCreateModalOpen(false);
    alert('Dépense créée avec succès !');
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleExpenseEdited = () => {
    setIsEditModalOpen(false);
    setEditingExpense(null);
    alert('Dépense modifiée avec succès !');
  };

  const totalExpensePages = Math.ceil(groupExpenses.length / EXPENSES_PER_PAGE);
  const paginatedExpenses = groupExpenses.slice((expensePage - 1) * EXPENSES_PER_PAGE, expensePage * EXPENSES_PER_PAGE);

  return (
    <div className="group-detail">
      <div className="group-header">
        <h2>{group.name}</h2>
        {group.description && (
          <p className="group-description">{group.description}</p>
        )}
        <div className="group-members">
          <strong>Membres :</strong> {group.members.map(member => member.name).join(', ')}
        </div>
      </div>

      <div className="section-header">
        <h3>Résumé des soldes</h3>
      </div>
      <BalanceSummary balances={calculateBalances(groupExpenses, group.members)} />

      <div className="section-header">
        <h3>Dépenses</h3>
        <div className="section-actions">
          <button className="btn btn-secondary" onClick={() => setIsExportModalOpen(true)}>
            📊 Exporter
          </button>
          <button className="btn btn-primary" onClick={handleCreateExpense}>
            + Ajouter une dépense
          </button>
        </div>
      </div>

      <ExpenseList 
        expenses={paginatedExpenses}
        users={group.members}
        onExpenseEdit={handleEditExpense}
      />
      {groupExpenses.length > EXPENSES_PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary btn-small" onClick={() => setExpensePage(p => Math.max(1, p - 1))} disabled={expensePage === 1}>Précédent</button>
          <span style={{ alignSelf: 'center' }}>Page {expensePage} / {totalExpensePages}</span>
          <button className="btn btn-secondary btn-small" onClick={() => setExpensePage(p => Math.min(totalExpensePages, p + 1))} disabled={expensePage === totalExpensePages}>Suivant</button>
        </div>
      )}

      {/* Create Expense Modal */}
      <CreateExpenseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleExpenseCreated}
        groupId={groupId}
        groupMembers={group.members}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onSuccess={handleExpenseEdited}
        expense={editingExpense}
        users={group.members}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        group={group}
        expenses={groupExpenses}
        users={group.members}
      />
    </div>
  );
};

export default GroupDetail; 