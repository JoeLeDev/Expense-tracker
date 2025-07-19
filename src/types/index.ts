// Types pour l'application Sumeria Expense Tracker

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  paidBy: string; // User ID
  paidFor: string[]; // Array of User IDs
  date: Date;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Balance {
  userId: string;
  userName: string;
  balance: number; // Positive = owes money, Negative = is owed money
}

export interface Settlement {
  from: string; // User ID
  to: string; // User ID
  amount: number;
}

export interface ExpenseFormData {
  amount: number;
  description: string;
  paidBy: string;
  paidFor: string[];
  category?: string;
  date: Date;
}

export interface GroupFormData {
  name: string;
  description?: string;
  members: string[]; // Array of user names/emails
}

export type HistoryAction = 
  | 'CREATE_GROUP'
  | 'UPDATE_GROUP'
  | 'DELETE_GROUP'
  | 'CREATE_EXPENSE'
  | 'UPDATE_EXPENSE'
  | 'DELETE_EXPENSE';

export interface HistoryEntry {
  id: string;
  action: HistoryAction;
  entityType: 'group' | 'expense';
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: {
    before?: any;
    after?: any;
    description: string;
  };
} 