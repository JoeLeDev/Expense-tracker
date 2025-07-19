import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, ExpenseFormData } from '../types';

// Simulation d'une API locale avec localStorage
const EXPENSES_KEY = 'sumeria_expenses';

const getExpenses = (): Expense[] => {
  const stored = localStorage.getItem(EXPENSES_KEY);
  return stored ? JSON.parse(stored).map((expense: any) => ({
    ...expense,
    date: new Date(expense.date),
    createdAt: new Date(expense.createdAt),
    updatedAt: new Date(expense.updatedAt),
  })) : [];
};

const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const useExpenses = (groupId?: string) => {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => {
      const expenses = getExpenses();
      return groupId ? expenses.filter(expense => expense.groupId === groupId) : expenses;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<Expense, Error, ExpenseFormData & { groupId: string }>({
    mutationFn: async (data: ExpenseFormData & { groupId: string }) => {
      const expenses = getExpenses();
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...data,
        date: data.date || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expenses.push(newExpense);
      saveExpenses(expenses);
      return newExpense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.groupId] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<Expense, Error, { id: string; updates: Partial<ExpenseFormData> }>({
    mutationFn: async (data: { id: string; updates: Partial<ExpenseFormData> }) => {
      const expenses = getExpenses();
      const index = expenses.findIndex(expense => expense.id === data.id);
      
      if (index === -1) throw new Error('Expense not found');
      
      expenses[index] = {
        ...expenses[index],
        ...data.updates,
        updatedAt: new Date(),
      };
      
      saveExpenses(expenses);
      return expenses[index];
    },
    onSuccess: (updatedExpense) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', updatedExpense.groupId] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<Expense, Error, string>({
    mutationFn: async (expenseId: string) => {
      const expenses = getExpenses();
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) throw new Error('Expense not found');
      
      const filteredExpenses = expenses.filter(e => e.id !== expenseId);
      saveExpenses(filteredExpenses);
      return expense;
    },
    onSuccess: (deletedExpense) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', deletedExpense.groupId] });
    },
  });
}; 