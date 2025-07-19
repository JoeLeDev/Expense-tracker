import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateGroup, useDeleteGroup } from '../useGroups';
import { Group } from '../../types';

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useUpdateGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('met à jour un groupe existant', async () => {
    const existingGroups: Group[] = [
      {
        id: '1',
        name: 'Ancien nom',
        description: 'Ancienne description',
        members: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingGroups));

    const { result } = renderHook(() => useUpdateGroup(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: '1',
        updates: {
          name: 'Nouveau nom',
          description: 'Nouvelle description',
          members: ['Alice', 'Bob', 'Charlie']
        }
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sumeria_groups',
      expect.stringContaining('"name":"Nouveau nom"')
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sumeria_groups',
      expect.stringContaining('"description":"Nouvelle description"')
    );
  });

  it('gère les erreurs lors de la mise à jour', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Erreur localStorage');
    });

    const { result } = renderHook(() => useUpdateGroup(), {
      wrapper: createWrapper()
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          id: '1',
          updates: {
            name: 'Nouveau nom',
            members: ['Alice']
          }
        });
      })
    ).rejects.toThrow('Erreur localStorage');
  });

  it('met à jour updatedAt lors de la modification', async () => {
    const existingGroups: Group[] = [
      {
        id: '1',
        name: 'Test',
        members: [{ id: '1', name: 'Alice' }],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingGroups));

    const { result } = renderHook(() => useUpdateGroup(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: '1',
        updates: {
          name: 'Nouveau nom',
          members: ['Alice']
        }
      });
    });

    const savedGroups = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    const updatedGroup = savedGroups[0];
    
    expect(new Date(updatedGroup.updatedAt).getTime()).toBeGreaterThan(
      new Date('2023-01-01').getTime()
    );
  });
});

describe('useDeleteGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('supprime un groupe existant', async () => {
    const existingGroups: Group[] = [
      {
        id: '1',
        name: 'Groupe à supprimer',
        members: [{ id: '1', name: 'Alice' }],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Groupe à conserver',
        members: [{ id: '2', name: 'Bob' }],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingGroups));

    const { result } = renderHook(() => useDeleteGroup(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    // Vérifier que le bon groupe a été supprimé
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].id).toBe('2');
    expect(savedData[0].name).toBe('Groupe à conserver');
  });

  it('gère les erreurs lors de la suppression', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Erreur localStorage');
    });

    const { result } = renderHook(() => useDeleteGroup(), {
      wrapper: createWrapper()
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('1');
      })
    ).rejects.toThrow('Erreur localStorage');
  });

  it('ne fait rien si le groupe n\'existe pas', async () => {
    const existingGroups: Group[] = [
      {
        id: '1',
        name: 'Groupe existant',
        members: [{ id: '1', name: 'Alice' }],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingGroups));

    const { result } = renderHook(() => useDeleteGroup(), {
      wrapper: createWrapper()
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('groupe-inexistant');
      })
    ).rejects.toThrow('Group not found');

    // Vérifier qu'aucune modification n'a été faite
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('supprime tous les groupes si c\'est le dernier', async () => {
    const existingGroups: Group[] = [
      {
        id: '1',
        name: 'Dernier groupe',
        members: [{ id: '1', name: 'Alice' }],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingGroups));

    const { result } = renderHook(() => useDeleteGroup(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sumeria_groups',
      JSON.stringify([])
    );
  });
}); 