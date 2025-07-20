import React, { useState } from 'react';
import { useCreateGroup } from '../hooks/useGroups';

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
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-group-title">
        <div className="modal-header">
          <h2 id="create-group-title">Créer un nouveau groupe</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer la modale">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Nom du groupe *</label>
            <input
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
            <textarea
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
                <input
                  type="text"
                  value={member}
                  onChange={(e) => updateMember(index, e.target.value)}
                  placeholder="Nom du membre"
                  required
                  aria-label={`Nom du membre ${index + 1}`}
                />
                {formData.members.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => removeMember(index)}
                    aria-label={`Supprimer le membre ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addMember}
              aria-label="Ajouter un membre"
            >
              + Ajouter un membre
            </button>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              aria-label="Annuler la création du groupe"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createGroupMutation.isPending}
              aria-label="Créer le groupe"
            >
              {createGroupMutation.isPending ? 'Création...' : 'Créer le groupe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal; 