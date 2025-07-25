import React, { useState } from 'react';
import { useCreateExpense } from '../hooks/useExpenses';
import { User } from '../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  groupMembers: User[];
}

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  groupId,
  groupMembers
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    paidBy: '',
    paidFor: [] as string[],
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const createExpenseMutation = useCreateExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.paidFor.length === 0) {
      alert('Veuillez sélectionner au moins une personne qui bénéficie de cette dépense');
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        amount: parseFloat(formData.amount),
        description: formData.description,
        paidBy: formData.paidBy,
        paidFor: formData.paidFor,
        category: formData.category || undefined,
        date: new Date(formData.date),
        groupId
      });
      onSuccess();
      setFormData({
        amount: '',
        description: '',
        paidBy: '',
        paidFor: [],
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert('Erreur lors de l\'ajout de la dépense');
    }
  };

  const togglePaidFor = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      paidFor: prev.paidFor.includes(userId)
        ? prev.paidFor.filter(id => id !== userId)
        : [...prev.paidFor, userId]
    }));
  };

  const selectAllMembers = () => {
    setFormData(prev => ({
      ...prev,
      paidFor: groupMembers.map(member => member.id)
    }));
  };

  const clearAllMembers = () => {
    setFormData(prev => ({
      ...prev,
      paidFor: []
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter une dépense" labelledById="create-expense-title">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="amount">Montant (€) *</label>
          <Input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required
            placeholder="0.00"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <Input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            placeholder="Ex: Restaurant"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Catégorie (optionnel)</label>
          <Input
            type="text"
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Ex: Nourriture, Transport, Loisirs"
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <Input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
            <option value="">Sélectionner une personne</option>
            {groupMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Payé pour *</label>
          <div className="member-selection">
            <div className="member-selection-actions">
              <Button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={selectAllMembers}
                aria-label="Tout sélectionner"
              >
                Tout sélectionner
              </Button>
              <Button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={clearAllMembers}
                aria-label="Tout désélectionner"
              >
                Tout désélectionner
              </Button>
            </div>
            <div className="member-checkboxes">
              {groupMembers.map(member => (
                <label key={member.id} className="member-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.paidFor.includes(member.id)}
                    onChange={() => togglePaidFor(member.id)}
                    aria-label={`Sélectionner ${member.name}`}
                  />
                  <span>{member.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            aria-label="Annuler la création de la dépense"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="btn btn-primary"
            disabled={createExpenseMutation.isPending}
            aria-label="Ajouter la dépense"
          >
            {createExpenseMutation.isPending ? 'Ajout...' : 'Ajouter la dépense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateExpenseModal; 