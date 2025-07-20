import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as notifyModule from '../../hooks/notify';
import EditGroupModal from '../EditGroupModal';

jest.mock('../../hooks/notify');
const mockNotify = notifyModule.notify as jest.Mock;

const baseGroup = {
  id: '1',
  name: 'Groupe Test',
  description: 'desc',
  members: [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('EditGroupModal (notifications)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('notifie lors de l\'ajout d\'un membre', () => {
    renderWithQueryClient(
      <EditGroupModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        group={baseGroup}
      />
    );
    fireEvent.click(screen.getByText('+ Ajouter un membre'));
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Membre ajouté',
        status: 'info',
      })
    );
  });

  it('notifie lors de la suppression d\'un membre', () => {
    renderWithQueryClient(
      <EditGroupModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        group={baseGroup}
      />
    );
    // Ajouter un membre pour pouvoir le supprimer
    fireEvent.click(screen.getByText('+ Ajouter un membre'));
    // Supprimer le dernier membre
    const deleteButtons = screen.getAllByRole('button', { name: '×' });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Membre supprimé',
        status: 'warning',
      })
    );
  });
}); 