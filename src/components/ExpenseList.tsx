import React from 'react';
import { Expense, User } from '../types';
import { formatCurrency } from '../utils/balanceCalculator';

interface ExpenseListProps {
  expenses: Expense[];
  groupMembers: User[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, groupMembers }) => {
  const getUserName = (userId: string) => {
    const user = groupMembers.find(u => u.id === userId);
    return user ? user.name : 'Inconnu';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (expenses.length === 0) {
    return (
      <div className="empty-expenses">
        <p>Aucune dépense enregistrée pour le moment.</p>
        <p>Ajoutez votre première dépense pour commencer !</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((expense) => (
          <div key={expense.id} className="expense-card">
            <div className="expense-header">
              <div className="expense-info">
                <h4 className="expense-description">{expense.description}</h4>
                <div className="expense-meta">
                  <span className="expense-date">{formatDate(expense.date)}</span>
                  {expense.category && (
                    <span className="expense-category">{expense.category}</span>
                  )}
                </div>
              </div>
              <div className="expense-amount">
                {formatCurrency(expense.amount)}
              </div>
            </div>
            
            <div className="expense-details">
              <div className="expense-paid-by">
                <span className="label">Payé par:</span>
                <span className="value">{getUserName(expense.paidBy)}</span>
              </div>
              <div className="expense-paid-for">
                <span className="label">Pour:</span>
                <span className="value">
                  {expense.paidFor.map(userId => getUserName(userId)).join(', ')}
                </span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ExpenseList; 