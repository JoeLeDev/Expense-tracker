import React from 'react';
import { Group } from '../types';

interface GroupListProps {
  groups: Group[];
  onGroupSelect: (groupId: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onGroupSelect }) => {
  return (
    <div className="group-list">
      {groups.map((group) => (
        <div
          key={group.id}
          className="group-card"
          onClick={() => onGroupSelect(group.id)}
        >
          <div className="group-info">
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
            <span className="arrow">→</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupList; 