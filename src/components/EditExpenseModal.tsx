import React, { useState, useEffect } from 'react';
import { useUpdateExpense } from '../hooks/useExpenses';
import { Expense, User } from '../types';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense: Expense | null;
  users: User[];
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  expense,
  users
}) => {
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    paidBy: '',
    paidFor: [] as string[],
    category: '',
    date: new Date()
  });

  const updateExpenseMutation = useUpdateExpense();

  // Initialiser le formulaire quand la dépense change
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount,
        description: expense.description,
        paidBy: expense.paidBy,
        paidFor: expense.paidFor,
        category: expense.category || '',
        date: new Date(expense.date)
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expense) return;

    if (formData.amount <= 0) {
      alert('Le montant doit être supérieur à 0');
      return;
    }

    if (!formData.description.trim()) {
      alert('Veuillez saisir une description');
      return;
    }

    if (!formData.paidBy) {
      alert('Veuillez sélectionner qui a payé');
      return;
    }

    if (formData.paidFor.length === 0) {
      alert('Veuillez sélectionner au moins une personne pour qui la dépense a été faite');
      return;
    }

    try {
      await updateExpenseMutation.mutateAsync({
        id: expense.id,
        updates: {
          amount: formData.amount,
          description: formData.description,
          paidBy: formData.paidBy,
          paidFor: formData.paidFor,
          category: formData.category || undefined,
          date: formData.date
        }
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erreur lors de la modification de la dépense');
    }
  };

  const handlePaidForChange = (userId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        paidFor: [...prev.paidFor, userId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        paidFor: prev.paidFor.filter(id => id !== userId)
      }));
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-expense-title">
        <div className="modal-header">
          <h2 id="edit-expense-title">Modifier la dépense</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer la modale">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              placeholder="Ex: Restaurant, Transport, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Montant (€) *</label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Catégorie (optionnel)</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Transport">Transport</option>
              <option value="Logement">Logement</option>
              <option value="Loisirs">Loisirs</option>
              <option value="Courses">Courses</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="paidBy">Payé par *</label>
            <select
              id="paidBy"
              value={formData.paidBy}
              onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value }))}
              required
            >
              <option value="">Sélectionner qui a payé</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payé pour *</label>
            <div className="checkbox-group">
              {users.map((user) => (
                <label key={user.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.paidFor.includes(user.id)}
                    onChange={(e) => handlePaidForChange(user.id, e.target.checked)}
                    aria-label={`Sélectionner ${user.name}`}
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              aria-label="Annuler la modification de la dépense"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateExpenseMutation.isPending}
              aria-label="Modifier la dépense"
            >
              {updateExpenseMutation.isPending ? 'Modification...' : 'Modifier la dépense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal; 