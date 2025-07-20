import React, { useState, useEffect } from 'react';
import { useUpdateGroup } from '../hooks/useGroups';
import { Group } from '../types';
import { notify } from '../hooks/notify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: Group | null;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  group
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });

  const updateGroupMutation = useUpdateGroup();

  // Initialiser le formulaire quand le groupe change
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        members: group.members.map(member => member.name)
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group) return;

    const members = formData.members.filter(member => member.trim() !== '');
    if (members.length === 0) {
      notify({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins un membre',
        status: 'error',
      });
      return;
    }

    try {
      await updateGroupMutation.mutateAsync({
        id: group.id,
        updates: {
          name: formData.name,
          description: formData.description || undefined,
          members
        }
      });
      onSuccess();
      onClose();
    } catch (error) {
      notify({
        title: 'Erreur',
        description: 'Erreur lors de la modification du groupe',
        status: 'error',
      });
    }
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, '']
    }));
    notify({
      title: 'Membre ajouté',
      description: 'Un nouveau membre a été ajouté au groupe.',
      status: 'info',
    });
  };

  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
    notify({
      title: 'Membre supprimé',
      description: 'Le membre a été retiré du groupe.',
      status: 'warning',
    });
  };

  const updateMember = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => i === index ? value : member)
    }));
  };

  if (!isOpen || !group) return null;

  return (
    <Modal isOpen={isOpen && !!group} onClose={onClose} title="Modifier le groupe" labelledById="edit-group-title">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="name">Nom du groupe *</label>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Ex: Voyage à Paris"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (optionnel)</label>
          <Input
            textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Ex: Dépenses pour notre voyage à Paris"
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Membres du groupe *</label>
          {formData.members.map((member, index) => (
            <div key={index} className="member-input">
              <Input
                type="text"
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
                placeholder="Nom du membre"
                required
                aria-label={`Nom du membre ${index + 1}`}
              />
              {formData.members.length > 1 && (
                <Button
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => removeMember(index)}
                  aria-label={`Supprimer le membre ${index + 1}`}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={addMember}
            aria-label="Ajouter un membre"
          >
            + Ajouter un membre
          </Button>
        </div>
        <div className="modal-actions">
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            aria-label="Annuler la modification du groupe"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="btn btn-primary"
            disabled={updateGroupMutation.isPending}
            aria-label="Modifier le groupe"
          >
            {updateGroupMutation.isPending ? 'Modification...' : 'Modifier le groupe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGroupModal; 