import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as notifyModule from '../notify';
import { useCreateExpense, useUpdateExpense, useDeleteExpense } from '../useExpenses';

jest.mock('../notify');
const mockNotify = notifyModule.notify as jest.Mock;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('useExpenses (notifications)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('notifie lors de la création d\'une dépense', async () => {
    const { result } = renderHook(() => useCreateExpense(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        groupId: '1',
        amount: 50,
        description: 'Restaurant',
        paidBy: 'user1',
        paidFor: ['user1', 'user2'],
        date: new Date(),
      });
    });
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Dépense ajoutée',
        status: 'success',
      })
    );
  });

  it('notifie lors de la modification d\'une dépense', async () => {
    // Créer une dépense d'abord
    const { result: createResult } = renderHook(() => useCreateExpense(), { wrapper: createWrapper() });
    let expenseId = '';
    await act(async () => {
      const expense = await createResult.current.mutateAsync({
        groupId: '1',
        amount: 20,
        description: 'Café',
        paidBy: 'user1',
        paidFor: ['user1'],
        date: new Date(),
      });
      expenseId = expense.id;
    });
    const { result } = renderHook(() => useUpdateExpense(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        id: expenseId,
        updates: { amount: 30 },
      });
    });
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Dépense modifiée',
        status: 'success',
      })
    );
  });

  it('notifie lors de la suppression d\'une dépense', async () => {
    // Créer une dépense d'abord
    const { result: createResult } = renderHook(() => useCreateExpense(), { wrapper: createWrapper() });
    let expenseId = '';
    await act(async () => {
      const expense = await createResult.current.mutateAsync({
        groupId: '1',
        amount: 10,
        description: 'Baguette',
        paidBy: 'user1',
        paidFor: ['user1'],
        date: new Date(),
      });
      expenseId = expense.id;
    });
    const { result } = renderHook(() => useDeleteExpense(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync(expenseId);
    });
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Dépense supprimée',
        status: 'success',
      })
    );
  });
}); 