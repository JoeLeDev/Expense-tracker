import { Expense, Balance, Settlement, User } from '../types';

export const calculateBalances = (expenses: Expense[], users: User[]): Balance[] => {
  const balances: { [userId: string]: number } = {};
  
  // Initialiser les soldes à 0
  users.forEach(user => {
    balances[user.id] = 0;
  });
  
  // Calculer les soldes pour chaque dépense
  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    const amount = expense.amount;
    const paidForCount = expense.paidFor.length;
    const amountPerPerson = amount / paidForCount;
    
    // La personne qui a payé reçoit l'argent
    balances[paidBy] += amount;
    
    // Chaque personne qui a bénéficié doit payer sa part
    expense.paidFor.forEach(userId => {
      balances[userId] -= amountPerPerson;
    });
  });
  
  // Convertir en tableau de Balance
  return users.map(user => ({
    userId: user.id,
    userName: user.name,
    balance: Math.round(balances[user.id] * 100) / 100, // Arrondir à 2 décimales
  }));
};

export const calculateSettlements = (balances: Balance[]): Settlement[] => {
  const settlements: Settlement[] = [];
  const sortedBalances = [...balances].sort((a, b) => b.balance - a.balance);
  
  let i = 0;
  let j = sortedBalances.length - 1;
  
  while (i < j) {
    const debtor = sortedBalances[i];
    const creditor = sortedBalances[j];
    
    if (debtor.balance <= 0 || creditor.balance >= 0) {
      break;
    }
    
    const amount = Math.min(debtor.balance, Math.abs(creditor.balance));
    
    if (amount > 0.01) { // Ignorer les montants très petits
      settlements.push({
        from: creditor.userId,
        to: debtor.userId,
        amount: Math.round(amount * 100) / 100,
      });
      
      debtor.balance -= amount;
      creditor.balance += amount;
    }
    
    if (debtor.balance <= 0.01) i++;
    if (creditor.balance >= -0.01) j--;
  }
  
  return settlements;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const getTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const getExpensesByUser = (expenses: Expense[], userId: string): Expense[] => {
  return expenses.filter(expense => 
    expense.paidBy === userId || expense.paidFor.includes(userId)
  );
};

export const getTotalPaidByUser = (expenses: Expense[], userId: string): number => {
  return expenses
    .filter(expense => expense.paidBy === userId)
    .reduce((total, expense) => total + expense.amount, 0);
};

export const getTotalOwedByUser = (expenses: Expense[], userId: string): number => {
  return expenses
    .filter(expense => expense.paidFor.includes(userId))
    .reduce((total, expense) => {
      const amountPerPerson = expense.amount / expense.paidFor.length;
      return total + amountPerPerson;
    }, 0);
}; 