import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Group, GroupFormData, User } from '../types';

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
      return newGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, { id: string; updates: Partial<GroupFormData> }>({
    mutationFn: async (data: { id: string; updates: Partial<GroupFormData> }) => {
      const groups = getGroups();
      const index = groups.findIndex(group => group.id === data.id);
      
      if (index === -1) throw new Error('Group not found');
      
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
      
      groups[index] = updatedGroup;
      
      saveGroups(groups);
      return groups[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, string>({
    mutationFn: async (groupId: string) => {
      const groups = getGroups();
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');
      
      const filteredGroups = groups.filter(g => g.id !== groupId);
      saveGroups(filteredGroups);
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}; 