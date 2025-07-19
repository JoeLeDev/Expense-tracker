import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroupList from '../GroupList';
import { Group } from '../../types';

// Mock des hooks
const mockMutateAsync = jest.fn();
const mockIsPending = false;

jest.mock('../../hooks/useGroups', () => ({
  useDeleteGroup: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending
  })
}));

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Voyage à Paris',
    description: 'Dépenses pour notre voyage',
    members: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Restaurant',
    description: 'Dîner entre amis',
    members: [
      { id: '3', name: 'Charlie' },
      { id: '4', name: 'Diana' },
      { id: '5', name: 'Eve' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('GroupList', () => {
  const mockOnGroupSelect = jest.fn();
  const mockOnGroupEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('affiche la liste des groupes', () => {
    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    expect(screen.getByText('Voyage à Paris')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Dépenses pour notre voyage')).toBeInTheDocument();
    expect(screen.getByText('Dîner entre amis')).toBeInTheDocument();
  });

  it('affiche le nombre de membres pour chaque groupe', () => {
    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    expect(screen.getByText('2 membres')).toBeInTheDocument();
    expect(screen.getByText('3 membres')).toBeInTheDocument();
  });

  it('affiche "membre" au singulier pour un seul membre', () => {
    const singleMemberGroup: Group = {
      id: '3',
      name: 'Solo',
      description: 'Groupe solo',
      members: [{ id: '6', name: 'Frank' }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    render(
      <GroupList 
        groups={[singleMemberGroup]} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    expect(screen.getByText('1 membre')).toBeInTheDocument();
  });

  it('appelle onGroupSelect quand on clique sur un groupe', () => {
    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    fireEvent.click(screen.getByText('Voyage à Paris'));
    expect(mockOnGroupSelect).toHaveBeenCalledWith('1');
  });

  it('affiche les boutons d\'édition et de suppression pour chaque groupe', () => {
    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    // Vérifier qu'il y a 2 boutons d'édition (✏️) et 2 boutons de suppression (🗑️)
    const editButtons = screen.getAllByTitle('Modifier le groupe');
    const deleteButtons = screen.getAllByTitle('Supprimer le groupe');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('appelle onGroupEdit quand on clique sur le bouton d\'édition', () => {
    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    const editButtons = screen.getAllByTitle('Modifier le groupe');
    fireEvent.click(editButtons[0]);

    expect(mockOnGroupEdit).toHaveBeenCalledWith(mockGroups[0]);
  });

  it('n\'appelle pas onGroupSelect quand on clique sur le bouton d\'édition', () => {
    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    const editButtons = screen.getAllByTitle('Modifier le groupe');
    fireEvent.click(editButtons[0]);

    expect(mockOnGroupSelect).not.toHaveBeenCalled();
  });

  it('affiche une confirmation avant de supprimer un groupe', async () => {
    // Mock de window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    const deleteButtons = screen.getAllByTitle('Supprimer le groupe');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Êtes-vous sûr de vouloir supprimer le groupe "Voyage à Paris" ? Cette action est irréversible.'
    );

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Groupe supprimé avec succès');
    });

    mockConfirm.mockRestore();
    mockAlert.mockRestore();
  });

  it('n\'appelle pas onGroupSelect quand on clique sur le bouton de suppression', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    const deleteButtons = screen.getAllByTitle('Supprimer le groupe');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnGroupSelect).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
    mockAlert.mockRestore();
  });

  it('n\'appelle pas la suppression si l\'utilisateur annule la confirmation', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    const deleteButtons = screen.getAllByTitle('Supprimer le groupe');
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
      <GroupList 
        groups={mockGroups} 
        onGroupSelect={mockOnGroupSelect}
        onGroupEdit={mockOnGroupEdit}
      />
    );

    const deleteButtons = screen.getAllByTitle('Supprimer le groupe');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Erreur lors de la suppression du groupe');
    });

    mockConfirm.mockRestore();
    mockAlert.mockRestore();
  });
}); 