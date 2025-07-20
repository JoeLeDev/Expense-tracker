import React, { useState } from 'react';
import { useCreateGroup } from '../hooks/useGroups';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [''] // Commencer avec un membre vide
  });

  const createGroupMutation = useCreateGroup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const members = formData.members.filter(member => member.trim() !== '');
    if (members.length === 0) {
      alert('Veuillez ajouter au moins un membre');
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        members
      });
      onSuccess();
      setFormData({ name: '', description: '', members: [''] });
    } catch (error) {
      alert('Erreur lors de la création du groupe');
    }
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, '']
    }));
  };

  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const updateMember = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => i === index ? value : member)
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un nouveau groupe" labelledById="create-group-title">
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
            aria-label="Annuler la création du groupe"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="btn btn-primary"
            disabled={createGroupMutation.isPending}
            aria-label="Créer le groupe"
          >
            {createGroupMutation.isPending ? 'Création...' : 'Créer le groupe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal; 