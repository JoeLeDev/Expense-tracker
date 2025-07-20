import React, { useState, useEffect } from 'react';
import { useGroups } from './hooks/useGroups';
import GroupList from './components/GroupList';
import GroupDetail from './components/GroupDetail';
import CreateGroupModal from './components/CreateGroupModal';
import EditGroupModal from './components/EditGroupModal';
import HistoryModal from './components/HistoryModal';
import { Group } from './types';
import './App.css';

function App() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const { data: groups = [], isLoading, error } = useGroups();
  const [groupPage, setGroupPage] = useState(1);
  const GROUPS_PER_PAGE = 5;
  const totalGroupPages = Math.ceil(groups.length / GROUPS_PER_PAGE);
  const paginatedGroups = groups.slice((groupPage - 1) * GROUPS_PER_PAGE, groupPage * GROUPS_PER_PAGE);

  useEffect(() => {
    setGroupPage(1);
  }, [groups.length]);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleBackToGroups = () => {
    setSelectedGroupId(null);
  };

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleGroupCreated = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsEditModalOpen(true);
  };

  const handleGroupEdited = () => {
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h1>Erreur</h1>
          <p>Une erreur est survenue lors du chargement des données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="title"> Sumeria Expense Tracker</h1>
          <p className="subtitle">Gérez vos remboursements entre amis simplement</p>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsHistoryModalOpen(true)}
            style={{ marginTop: '10px' }}
          >
            📋 Historique
          </button>
        </header>

        {/* Navigation */}
        {selectedGroupId && (
          <div className="navigation">
            <button className="btn btn-ghost" onClick={handleBackToGroups}>
              ← Retour aux groupes
            </button>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="loading">
            <p>Chargement...</p>
          </div>
        ) : selectedGroupId ? (
          <GroupDetail 
            groupId={selectedGroupId} 
            onBack={handleBackToGroups}
          />
        ) : (
          <div className="main-content">
            <div className="section-header">
              <h2>Mes Groupes</h2>
              <button className="btn btn-primary" onClick={handleCreateGroup}>
                + Créer un groupe
              </button>
            </div>
            
            {groups.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">Aucun groupe créé pour le moment</p>
                <p className="empty-description">
                  Créez votre premier groupe pour commencer à gérer vos dépenses
                </p>
              </div>
            ) : (
              <GroupList 
                groups={paginatedGroups} 
                onGroupSelect={handleGroupSelect}
                onGroupEdit={handleEditGroup}
              />
            )}
            {groups.length > GROUPS_PER_PAGE && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary btn-small" onClick={() => setGroupPage(p => Math.max(1, p - 1))} disabled={groupPage === 1}>Précédent</button>
                <span style={{ alignSelf: 'center' }}>Page {groupPage} / {totalGroupPages}</span>
                <button className="btn btn-secondary btn-small" onClick={() => setGroupPage(p => Math.min(totalGroupPages, p + 1))} disabled={groupPage === totalGroupPages}>Suivant</button>
              </div>
            )}
          </div>
        )}

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleGroupCreated}
        />

        {/* Edit Group Modal */}
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingGroup(null);
          }}
          onSuccess={handleGroupEdited}
          group={editingGroup}
        />

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
