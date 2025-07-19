import React from 'react';
import { Expense, User } from '../types';
import { useDeleteExpense } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/balanceCalculator';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  onExpenseEdit: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, users, onExpenseEdit }) => {
  const deleteExpenseMutation = useDeleteExpense();

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Utilisateur inconnu';
  };

  const handleDeleteExpense = async (expenseId: string, expenseDescription: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la dépense "${expenseDescription}" ? Cette action est irréversible.`)) {
      try {
        await deleteExpenseMutation.mutateAsync(expenseId);
        alert('Dépense supprimée avec succès');
      } catch (error) {
        alert('Erreur lors de la suppression de la dépense');
      }
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">Aucune dépense enregistrée</p>
        <p className="empty-description">
          Ajoutez votre première dépense pour commencer à gérer vos remboursements
        </p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <div key={expense.id} className="expense-card">
          <div className="expense-header">
            <div className="expense-info">
              <h4 className="expense-description">{expense.description}</h4>
              <div className="expense-meta">
                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                <span className="expense-date">
                  {new Date(expense.date).toLocaleDateString('fr-FR')}
                </span>
                {expense.category && (
                  <span className="expense-category">{expense.category}</span>
                )}
              </div>
            </div>
            <div className="expense-actions">
              <button
                className="btn btn-secondary btn-small"
                onClick={() => onExpenseEdit(expense)}
                title="Modifier la dépense"
              >
                ✏️
              </button>
              <button
                className="btn btn-danger btn-small"
                onClick={() => handleDeleteExpense(expense.id, expense.description)}
                title="Supprimer la dépense"
                disabled={deleteExpenseMutation.isPending}
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div className="expense-details">
            <div className="expense-paid-by">
              <strong>Payé par :</strong> {getUserName(expense.paidBy)}
            </div>
            <div className="expense-paid-for">
              <strong>Pour :</strong> {expense.paidFor.map(userId => getUserName(userId)).join(', ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList; 