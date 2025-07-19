import React, { useState } from 'react';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseList from './ExpenseList';
import CreateExpenseModal from './CreateExpenseModal';
import EditExpenseModal from './EditExpenseModal';
import BalanceSummary from './BalanceSummary';
import { Expense } from '../types';

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
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
      <BalanceSummary expenses={groupExpenses} users={group.members} />

      <div className="section-header">
        <h3>Dépenses</h3>
        <button className="btn btn-primary" onClick={handleCreateExpense}>
          + Ajouter une dépense
        </button>
      </div>

      <ExpenseList 
        expenses={groupExpenses}
        users={group.members}
        onExpenseEdit={handleEditExpense}
      />

      {/* Create Expense Modal */}
      <CreateExpenseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleExpenseCreated}
        groupId={groupId}
        users={group.members}
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
    </div>
  );
};

export default GroupDetail; 