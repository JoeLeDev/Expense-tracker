import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HistoryEntry, HistoryAction, Group, Expense } from '../types';

const HISTORY_STORAGE_KEY = 'sumeria_history';

// Fonction pour récupérer l'historique depuis localStorage
const getHistory = (): HistoryEntry[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    return history.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'historique:', error);
    return [];
  }
};

// Fonction pour sauvegarder l'historique dans localStorage
const saveHistory = (history: HistoryEntry[]): void => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique:', error);
  }
};

// Fonction pour ajouter une entrée à l'historique
const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void => {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date()
  };
  
  // Ajouter au début de la liste (plus récent en premier)
  history.unshift(newEntry);
  
  // Garder seulement les 100 dernières entrées
  const limitedHistory = history.slice(0, 100);
  
  saveHistory(limitedHistory);
};

// Hook pour récupérer l'historique
export const useHistory = () => {
  return useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour ajouter une entrée à l'historique
export const useAddHistoryEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      addHistoryEntry(entry);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
};

// Fonction utilitaire pour créer une entrée d'historique pour un groupe
export const createGroupHistoryEntry = (
  action: HistoryAction,
  group: Group,
  userId: string,
  userName: string,
  details: { before?: Group; after?: Group; description: string }
): Omit<HistoryEntry, 'id' | 'timestamp'> => {
  return {
    action,
    entityType: 'group',
    entityId: group.id,
    entityName: group.name,
    userId,
    userName,
    details
  };
};

// Fonction utilitaire pour créer une entrée d'historique pour une dépense
export const createExpenseHistoryEntry = (
  action: HistoryAction,
  expense: Expense,
  groupName: string,
  userId: string,
  userName: string,
  details: { before?: Expense; after?: Expense; description: string }
): Omit<HistoryEntry, 'id' | 'timestamp'> => {
  return {
    action,
    entityType: 'expense',
    entityId: expense.id,
    entityName: `${expense.description} (${groupName})`,
    userId,
    userName,
    details
  };
};

// Fonction pour filtrer l'historique par type d'entité
export const filterHistoryByEntityType = (history: HistoryEntry[], entityType: 'group' | 'expense' | 'all'): HistoryEntry[] => {
  if (entityType === 'all') return history;
  return history.filter(entry => entry.entityType === entityType);
};

// Fonction pour filtrer l'historique par action
export const filterHistoryByAction = (history: HistoryEntry[], action: HistoryAction | 'all'): HistoryEntry[] => {
  if (action === 'all') return history;
  return history.filter(entry => entry.action === action);
};

// Fonction pour obtenir les descriptions d'action en français
export const getActionDescription = (action: HistoryAction): string => {
  const descriptions: Record<HistoryAction, string> = {
    CREATE_GROUP: 'Création du groupe',
    UPDATE_GROUP: 'Modification du groupe',
    DELETE_GROUP: 'Suppression du groupe',
    CREATE_EXPENSE: 'Ajout d\'une dépense',
    UPDATE_EXPENSE: 'Modification d\'une dépense',
    DELETE_EXPENSE: 'Suppression d\'une dépense'
  };
  
  return descriptions[action];
};

// Fonction pour obtenir l'icône d'action
export const getActionIcon = (action: HistoryAction): string => {
  const icons: Record<HistoryAction, string> = {
    CREATE_GROUP: '➕',
    UPDATE_GROUP: '✏️',
    DELETE_GROUP: '🗑️',
    CREATE_EXPENSE: '💰',
    UPDATE_EXPENSE: '✏️',
    DELETE_EXPENSE: '🗑️'
  };
  
  return icons[action];
}; 