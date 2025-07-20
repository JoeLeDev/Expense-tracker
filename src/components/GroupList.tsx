import React from 'react';
import { Group } from '../types';
import { useDeleteGroup } from '../hooks/useGroups';

interface GroupListProps {
  groups: Group[];
  onGroupSelect: (groupId: string) => void;
  onGroupEdit: (group: Group) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onGroupSelect, onGroupEdit }) => {
  const deleteGroupMutation = useDeleteGroup();

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ? Cette action est irréversible.`)) {
      try {
        await deleteGroupMutation.mutateAsync(groupId);
      } catch (error) {
        alert('Erreur lors de la suppression du groupe');
      }
    }
  };

  return (
    <div className="group-list">
      {groups.map((group) => (
        <div key={group.id} className="group-card">
          <div 
            className="group-info"
            onClick={() => onGroupSelect(group.id)}
            style={{ cursor: 'pointer' }}
          >
            <h3 className="group-name">{group.name}</h3>
            {group.description && (
              <p className="group-description">{group.description}</p>
            )}
            <div className="group-members">
              <span className="member-count">
                {group.members.length} membre{group.members.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="group-actions">
            <button
              className="btn btn-secondary btn-small"
              onClick={(e) => {
                e.stopPropagation();
                onGroupEdit(group);
              }}
              title="Modifier le groupe"
            >
              ✏️
            </button>
            <button
              className="btn btn-danger btn-small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGroup(group.id, group.name);
              }}
              title="Supprimer le groupe"
              disabled={deleteGroupMutation.isPending}
            >
              🗑️
            </button>
            <span className="arrow">→</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupList; 