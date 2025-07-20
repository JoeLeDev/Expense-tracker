import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as notifyModule from '../notify';
import { useCreateGroup, useUpdateGroup, useDeleteGroup } from '../useGroups';

jest.mock('../notify');

const mockNotify = notifyModule.notify as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useGroups (notifications)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('notifie lors de la création d\'un groupe', async () => {
    const { result } = renderHook(() => useCreateGroup(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        name: 'Test Groupe',
        members: ['Alice', 'Bob'],
      });
    });
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Groupe créé',
        status: 'success',
      })
    );
  });

  it('notifie lors de la modification d\'un groupe', async () => {
    // Créer un groupe d'abord
    const { result: createResult } = renderHook(() => useCreateGroup(), { wrapper: createWrapper() });
    let groupId = '';
    await act(async () => {
      const group = await createResult.current.mutateAsync({
        name: 'Groupe à modifier',
        members: ['Alice'],
      });
      groupId = group.id;
    });
    const { result } = renderHook(() => useUpdateGroup(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        id: groupId,
        updates: { name: 'Nouveau nom' },
      });
    });
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Groupe modifié',
        status: 'success',
      })
    );
  });

  it('notifie lors de la suppression d\'un groupe', async () => {
    // Créer un groupe d'abord
    const { result: createResult } = renderHook(() => useCreateGroup(), { wrapper: createWrapper() });
    let groupId = '';
    await act(async () => {
      const group = await createResult.current.mutateAsync({
        name: 'Groupe à supprimer',
        members: ['Alice'],
      });
      groupId = group.id;
    });
    const { result } = renderHook(() => useDeleteGroup(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync(groupId);
    });
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Groupe supprimé',
        status: 'success',
      })
    );
  });
}); 