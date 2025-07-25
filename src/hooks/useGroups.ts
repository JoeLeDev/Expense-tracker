import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Group, GroupFormData, User } from '../types';
import { useAddHistoryEntry, createGroupHistoryEntry } from './useHistory';
import { notify } from './notify';

// Simulation d'une API locale avec localStorage
const GROUPS_KEY = 'sumeria_groups';
const USERS_KEY = 'sumeria_users';

const getGroups = (): Group[] => {
  const stored = localStorage.getItem(GROUPS_KEY);
  return stored ? JSON.parse(stored).map((group: any) => ({
    ...group,
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt),
    members: group.members.map((member: any) => ({
      ...member,
      createdAt: member.createdAt ? new Date(member.createdAt) : new Date(),
    })),
  })) : [];
};

const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveGroups = (groups: Group[]) => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });
};

export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => {
      const groups = getGroups();
      return groups.find(group => group.id === groupId);
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const addHistoryEntry = useAddHistoryEntry();

  return useMutation<Group, Error, GroupFormData>({
    mutationFn: async (data: GroupFormData) => {
      const groups = getGroups();
      const users = getUsers();
      
      // Créer les utilisateurs s'ils n'existent pas
      const newUsers: User[] = [];
      data.members.forEach(memberName => {
        const existingUser = users.find(user => user.name === memberName);
        if (!existingUser) {
          const newUser: User = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: memberName,
          };
          newUsers.push(newUser);
        }
      });
      
      // Ajouter les nouveaux utilisateurs à la liste globale
      if (newUsers.length > 0) {
        users.push(...newUsers);
        saveUsers(users);
      }
      
      // Récupérer tous les utilisateurs (existants + nouveaux)
      const allUsers = getUsers();
      const groupMembers = allUsers.filter(user => 
        data.members.includes(user.name)
      );
      
      const newGroup: Group = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        members: groupMembers,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      groups.push(newGroup);
      saveGroups(groups);
      
      // Enregistrer dans l'historique
      const historyEntry = createGroupHistoryEntry(
        'CREATE_GROUP',
        newGroup,
        'system',
        'Système',
        {
          description: `Groupe "${newGroup.name}" créé avec ${newGroup.members.length} membre(s)`
        }
      );
      addHistoryEntry.mutate(historyEntry);
      
      return newGroup;
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notify({
        title: 'Groupe créé',
        description: `Le groupe "${newGroup.name}" a été créé avec succès.`,
        status: 'success',
      });
    },
    onError: (error) => {
      notify({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création du groupe.',
        status: 'error',
      });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const addHistoryEntry = useAddHistoryEntry();

  return useMutation<Group, Error, { id: string; updates: Partial<GroupFormData> }>({
    mutationFn: async (data: { id: string; updates: Partial<GroupFormData> }) => {
      const groups = getGroups();
      const index = groups.findIndex(group => group.id === data.id);
      
      if (index === -1) throw new Error('Groupe introuvable');
      
      const updatedGroup: Group = {
        ...groups[index],
        ...data.updates,
        updatedAt: new Date(),
        members: groups[index].members, // Garder les membres existants par défaut
      };
      
      // S'assurer que members reste un tableau d'utilisateurs
      if (data.updates.members) {
        const users = getUsers();
        updatedGroup.members = users.filter(user => 
          data.updates.members!.includes(user.name)
        );
      }
      
      const oldGroup = groups[index];
      groups[index] = updatedGroup;
      
      saveGroups(groups);
      
      // Enregistrer dans l'historique
      const historyEntry = createGroupHistoryEntry(
        'UPDATE_GROUP',
        updatedGroup,
        'system',
        'Système',
        {
          before: oldGroup,
          after: updatedGroup,
          description: `Groupe "${updatedGroup.name}" modifié`
        }
      );
      addHistoryEntry.mutate(historyEntry);
      
      return groups[index];
    },
    onSuccess: (updatedGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      notify({
        title: 'Groupe modifié',
        description: `Le groupe "${updatedGroup.name}" a été modifié avec succès.`,
        status: 'success',
      });
    },
    onError: (error) => {
      notify({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la modification du groupe.',
        status: 'error',
      });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const addHistoryEntry = useAddHistoryEntry();

  return useMutation<Group, Error, string>({
    mutationFn: async (groupId: string) => {
      const groups = getGroups();
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error('Groupe introuvable');
      
      const filteredGroups = groups.filter(g => g.id !== groupId);
      saveGroups(filteredGroups);
      
      // Enregistrer dans l'historique
      const historyEntry = createGroupHistoryEntry(
        'DELETE_GROUP',
        group,
        'system',
        'Système',
        {
          description: `Groupe "${group.name}" supprimé`
        }
      );
      addHistoryEntry.mutate(historyEntry);
      
      return group;
    },
    onSuccess: (deletedGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      notify({
        title: 'Groupe supprimé',
        description: `Le groupe "${deletedGroup.name}" a été supprimé avec succès.`,
        status: 'success',
      });
    },
    onError: (error) => {
      notify({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression du groupe.',
        status: 'error',
      });
    },
  });
}; 