import React, { useState } from 'react';
import { useHistory, filterHistoryByEntityType, filterHistoryByAction, getActionDescription, getActionIcon } from '../hooks/useHistory';
import { HistoryAction } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [entityFilter, setEntityFilter] = useState<'all' | 'group' | 'expense'>('all');
  const [actionFilter, setActionFilter] = useState<HistoryAction | 'all'>('all');
  
  const { data: history = [], isLoading, error } = useHistory();

  if (!isOpen) return null;

  // Filtrer l'historique
  let filteredHistory = history || [];
  filteredHistory = filterHistoryByEntityType(filteredHistory, entityFilter);
  filteredHistory = filterHistoryByAction(filteredHistory, actionFilter);

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return timestamp.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntityTypeIcon = (entityType: 'group' | 'expense'): string => {
    return entityType === 'group' ? '👥' : '💰';
  };

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Historique des modifications</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-content">
            <div className="loading">Chargement de l'historique...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Historique des modifications</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-content">
            <div className="error">Erreur lors du chargement de l'historique</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal history-modal">
        <div className="modal-header">
          <h2>📋 Historique des modifications</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {/* Filtres */}
          <div className="history-filters">
            <div className="filter-group">
              <label htmlFor="entity-filter">Type d'entité :</label>
              <select
                id="entity-filter"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value as 'all' | 'group' | 'expense')}
              >
                <option value="all">Tout</option>
                <option value="group">Groupes</option>
                <option value="expense">Dépenses</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="action-filter">Action :</label>
              <select
                id="action-filter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as HistoryAction | 'all')}
              >
                <option value="all">Toutes</option>
                <option value="CREATE_GROUP">Création de groupe</option>
                <option value="UPDATE_GROUP">Modification de groupe</option>
                <option value="DELETE_GROUP">Suppression de groupe</option>
                <option value="CREATE_EXPENSE">Ajout de dépense</option>
                <option value="UPDATE_EXPENSE">Modification de dépense</option>
                <option value="DELETE_EXPENSE">Suppression de dépense</option>
              </select>
            </div>
          </div>

          {/* Liste de l'historique */}
          <div className="history-list">
            {filteredHistory.length === 0 ? (
              <div className="empty-history">
                <p>Aucune modification trouvée</p>
                <small>Les modifications apparaîtront ici une fois que vous commencerez à utiliser l'application</small>
              </div>
            ) : (
              filteredHistory.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-item-header">
                    <div className="history-item-icon">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="history-item-info">
                      <div className="history-item-title">
                        {getActionDescription(entry.action)}
                      </div>
                      <div className="history-item-entity">
                        {getEntityTypeIcon(entry.entityType)} {entry.entityName}
                      </div>
                    </div>
                    <div className="history-item-time">
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                  
                  <div className="history-item-details">
                    <div className="history-item-user">
                      <span className="user-label">Par :</span>
                      <span className="user-name">{entry.userName}</span>
                    </div>
                    
                    {entry.details.description && (
                      <div className="history-item-description">
                        {entry.details.description}
                      </div>
                    )}
                    
                    {/* Afficher les détails des changements si disponibles */}
                    {entry.details.before && entry.details.after && (
                      <div className="history-item-changes">
                        <details>
                          <summary>Voir les changements</summary>
                          <div className="changes-details">
                            <div className="change-before">
                              <strong>Avant :</strong>
                              <pre>{JSON.stringify(entry.details.before, null, 2)}</pre>
                            </div>
                            <div className="change-after">
                              <strong>Après :</strong>
                              <pre>{JSON.stringify(entry.details.after, null, 2)}</pre>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal; 