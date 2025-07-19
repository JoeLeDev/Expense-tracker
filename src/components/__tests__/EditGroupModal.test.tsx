import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditGroupModal from '../EditGroupModal';
import { Group } from '../../types';

// Mock des hooks
const mockMutateAsync = jest.fn();
const mockIsPending = false;

jest.mock('../../hooks/useGroups', () => ({
  useUpdateGroup: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending
  })
}));

const mockGroup: Group = {
  id: '1',
  name: 'Voyage à Paris',
  description: 'Dépenses pour notre voyage',
  members: [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('EditGroupModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it('ne s\'affiche pas quand isOpen est false', () => {
    render(
      <EditGroupModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    expect(screen.queryByText('Modifier le groupe')).not.toBeInTheDocument();
  });

  it('ne s\'affiche pas quand group est null', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={null}
      />
    );

    expect(screen.queryByText('Modifier le groupe')).not.toBeInTheDocument();
  });

  it('affiche le modal avec les données du groupe pré-remplies', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    // Utiliser getAllByText pour gérer les éléments multiples
    const titleElements = screen.getAllByText('Modifier le groupe');
    expect(titleElements.length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('Voyage à Paris')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dépenses pour notre voyage')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
  });

  it('appelle onClose quand on clique sur le bouton de fermeture', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    const closeButtons = screen.getAllByText('×');
    fireEvent.click(closeButtons[0]); // Bouton de fermeture du modal
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('appelle onClose quand on clique sur Annuler', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('permet de modifier le nom du groupe', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    const nameInput = screen.getByDisplayValue('Voyage à Paris');
    fireEvent.change(nameInput, { target: { value: 'Nouveau nom' } });
    expect(nameInput).toHaveValue('Nouveau nom');
  });

  it('permet de modifier la description', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    const descriptionInput = screen.getByDisplayValue('Dépenses pour notre voyage');
    fireEvent.change(descriptionInput, { target: { value: 'Nouvelle description' } });
    expect(descriptionInput).toHaveValue('Nouvelle description');
  });

  it('permet de modifier les noms des membres', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    const aliceInput = screen.getByDisplayValue('Alice');
    fireEvent.change(aliceInput, { target: { value: 'Alice Modifiée' } });
    expect(aliceInput).toHaveValue('Alice Modifiée');
  });

  it('permet d\'ajouter un nouveau membre', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    fireEvent.click(screen.getByText('+ Ajouter un membre'));
    
    // Vérifier qu'un nouveau champ de saisie est apparu
    const memberInputs = screen.getAllByPlaceholderText('Nom du membre');
    expect(memberInputs).toHaveLength(3); // 2 membres existants + 1 nouveau
  });

  it('permet de supprimer un membre', () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    const deleteButtons = screen.getAllByText('×');
    // Prendre le premier bouton de suppression de membre (pas le bouton de fermeture du modal)
    fireEvent.click(deleteButtons[1]);

    // Vérifier qu'il ne reste qu'un membre
    const memberInputs = screen.getAllByPlaceholderText('Nom du membre');
    expect(memberInputs).toHaveLength(1);
  });

  it('n\'affiche pas le bouton de suppression pour le dernier membre', () => {
    const singleMemberGroup: Group = {
      id: '2',
      name: 'Solo',
      description: 'Groupe solo',
      members: [{ id: '3', name: 'Frank' }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={singleMemberGroup}
      />
    );

    // Il ne devrait pas y avoir de bouton de suppression de membre (seulement le bouton de fermeture du modal)
    const deleteButtons = screen.getAllByText('×');
    expect(deleteButtons).toHaveLength(1); // Seulement le bouton de fermeture du modal
  });

  it('soumet le formulaire avec les données modifiées', async () => {
    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    // Modifier le nom
    const nameInput = screen.getByDisplayValue('Voyage à Paris');
    fireEvent.change(nameInput, { target: { value: 'Nouveau nom' } });

    // Soumettre le formulaire (prendre le bouton, pas le titre)
    const submitButtons = screen.getAllByText('Modifier le groupe');
    fireEvent.click(submitButtons[1]); // Le bouton de soumission

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: '1',
        updates: {
          name: 'Nouveau nom',
          description: 'Dépenses pour notre voyage',
          members: ['Alice', 'Bob']
        }
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('affiche une erreur si aucun membre n\'est saisi', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    // Vider tous les champs de membres
    const memberInputs = screen.getAllByPlaceholderText('Nom du membre');
    memberInputs.forEach(input => {
      fireEvent.change(input, { target: { value: '' } });
    });

    // Soumettre le formulaire (prendre le bouton, pas le titre)
    const submitButtons = screen.getAllByText('Modifier le groupe');
    fireEvent.click(submitButtons[1]); // Le bouton de soumission

    expect(mockAlert).toHaveBeenCalledWith('Veuillez ajouter au moins un membre');
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    mockAlert.mockRestore();
  });

  it('affiche une erreur si la modification échoue', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Erreur de modification'));
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <EditGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        group={mockGroup}
      />
    );

    // Soumettre le formulaire (prendre le bouton, pas le titre)
    const submitButtons = screen.getAllByText('Modifier le groupe');
    fireEvent.click(submitButtons[1]); // Le bouton de soumission

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Erreur lors de la modification du groupe');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    mockAlert.mockRestore();
  });
}); 