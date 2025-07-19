import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExpenseList from '../ExpenseList';
import { Expense, User } from '../../types';

// Mock des hooks
const mockMutateAsync = jest.fn();
const mockIsPending = false;

jest.mock('../../hooks/useExpenses', () => ({
  useDeleteExpense: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending
  })
}));

const mockUsers: User[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' }
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    groupId: 'group1',
    amount: 50,
    description: 'Restaurant',
    paidBy: '1',
    paidFor: ['1', '2'],
    date: new Date(),
    category: 'Restaurant',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    groupId: 'group1',
    amount: 30,
    description: 'Transport',
    paidBy: '2',
    paidFor: ['1', '2', '3'],
    date: new Date(),
    category: 'Transport',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('ExpenseList', () => {
  const mockOnExpenseEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('affiche la liste des dépenses', () => {
    render(
      <ExpenseList 
        expenses={mockExpenses} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    // Utiliser des sélecteurs plus spécifiques
    expect(screen.getAllByText('Restaurant').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Transport').length).toBeGreaterThan(0);
    expect(screen.getByText('50,00 €')).toBeInTheDocument();
    expect(screen.getByText('30,00 €')).toBeInTheDocument();
  });

  it('affiche un message quand il n\'y a pas de dépenses', () => {
    render(
      <ExpenseList 
        expenses={[]} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    expect(screen.getByText('Aucune dépense enregistrée')).toBeInTheDocument();
    expect(screen.getByText('Ajoutez votre première dépense pour commencer à gérer vos remboursements')).toBeInTheDocument();
  });

  it('affiche les boutons d\'édition et de suppression pour chaque dépense', () => {
    render(
      <ExpenseList 
        expenses={mockExpenses} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    const editButtons = screen.getAllByTitle('Modifier la dépense');
    const deleteButtons = screen.getAllByTitle('Supprimer la dépense');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('appelle onExpenseEdit quand on clique sur le bouton d\'édition', () => {
    render(
      <ExpenseList 
        expenses={mockExpenses} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    const editButtons = screen.getAllByTitle('Modifier la dépense');
    fireEvent.click(editButtons[0]);

    expect(mockOnExpenseEdit).toHaveBeenCalledWith(mockExpenses[0]);
  });

  it('affiche une confirmation avant de supprimer une dépense', async () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ExpenseList 
        expenses={mockExpenses} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    const deleteButtons = screen.getAllByTitle('Supprimer la dépense');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Êtes-vous sûr de vouloir supprimer la dépense "Restaurant" ? Cette action est irréversible.'
    );

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Dépense supprimée avec succès');
    });

    mockConfirm.mockRestore();
    mockAlert.mockRestore();
  });

  it('n\'appelle pas la suppression si l\'utilisateur annule la confirmation', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ExpenseList 
        expenses={mockExpenses} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    const deleteButtons = screen.getAllByTitle('Supprimer la dépense');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
    mockAlert.mockRestore();
  });

  it('affiche une erreur si la suppression échoue', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Erreur de suppression'));
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ExpenseList 
        expenses={mockExpenses} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    const deleteButtons = screen.getAllByTitle('Supprimer la dépense');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Erreur lors de la suppression de la dépense');
    });

    mockConfirm.mockRestore();
    mockAlert.mockRestore();
  });

  it('affiche les détails de la dépense correctement', () => {
    render(
      <ExpenseList 
        expenses={mockExpenses} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    // Utiliser des sélecteurs plus spécifiques pour le texte fragmenté
    expect(screen.getAllByText(/Payé par :/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pour :/).length).toBeGreaterThan(0);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    // Vérifier que les montants sont affichés
    expect(screen.getByText('50,00 €')).toBeInTheDocument();
    expect(screen.getByText('30,00 €')).toBeInTheDocument();
  });

  it('affiche "Utilisateur inconnu" pour un utilisateur non trouvé', () => {
    const expenseWithUnknownUser: Expense = {
      id: '3',
      groupId: 'group1',
      amount: 25,
      description: 'Test',
      paidBy: 'unknown',
      paidFor: ['unknown'],
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    render(
      <ExpenseList 
        expenses={[expenseWithUnknownUser]} 
        users={mockUsers}
        onExpenseEdit={mockOnExpenseEdit}
      />
    );

    expect(screen.getAllByText('Utilisateur inconnu').length).toBeGreaterThan(0);
  });
}); 