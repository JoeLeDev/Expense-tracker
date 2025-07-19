import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, ExpenseFormData } from '../types';

// Récupérer les dépenses depuis localStorage
const getExpenses = (): Expense[] => {
  try {
    const stored = localStorage.getItem('expenses');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses:', error);
    return [];
  }
};

// Sauvegarder les dépenses dans localStorage
const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des dépenses:', error);
    throw error;
  }
};

// Hook pour récupérer les dépenses d'un groupe
export const useExpenses = (groupId: string) => {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => {
      const allExpenses = getExpenses();
      return allExpenses.filter(expense => expense.groupId === groupId);
    }
  });
};

// Hook pour créer une dépense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: ExpenseFormData & { groupId: string }) => {
      const expenses = getExpenses();
      const newExpense: Expense = {
        id: Date.now().toString(),
        groupId: expenseData.groupId,
        amount: expenseData.amount,
        description: expenseData.description,
        paidBy: expenseData.paidBy,
        paidFor: expenseData.paidFor,
        category: expenseData.category,
        date: expenseData.date,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedExpenses = [...expenses, newExpense];
      saveExpenses(updatedExpenses);
      return newExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });
};

// Hook pour mettre à jour une dépense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExpenseFormData> }) => {
      const expenses = getExpenses();
      const expenseIndex = expenses.findIndex(expense => expense.id === id);
      
      if (expenseIndex === -1) {
        throw new Error('Dépense non trouvée');
      }

      const updatedExpense = {
        ...expenses[expenseIndex],
        ...updates,
        updatedAt: new Date()
      };

      expenses[expenseIndex] = updatedExpense;
      saveExpenses(expenses);
      return updatedExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });
};

// Hook pour supprimer une dépense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const expenses = getExpenses();
      const filteredExpenses = expenses.filter(expense => expense.id !== expenseId);
      
      if (filteredExpenses.length === expenses.length) {
        throw new Error('Dépense non trouvée');
      }

      saveExpenses(filteredExpenses);
      return expenseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });
}; 