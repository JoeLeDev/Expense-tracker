import {
  calculateBalances,
  calculateSettlements,
  formatCurrency,
  getTotalExpenses,
  getExpensesByUser,
  getTotalPaidByUser,
  getTotalOwedByUser,
} from '../balanceCalculator';
import { Expense, User, Balance } from '../../types';

describe('balanceCalculator', () => {
  const mockUsers: User[] = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
  ];

  const mockExpenses: Expense[] = [
    {
      id: '1',
      groupId: 'group1',
      amount: 60,
      description: 'Restaurant',
      paidBy: '1', // Alice
      paidFor: ['1', '2', '3'], // Alice, Bob, Charlie
      date: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      groupId: 'group1',
      amount: 30,
      description: 'Transport',
      paidBy: '2', // Bob
      paidFor: ['1', '2'], // Alice, Bob
      date: new Date('2024-01-02'),
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  describe('calculateBalances', () => {
    it('should calculate correct balances for simple scenario', () => {
      const balances = calculateBalances(mockExpenses, mockUsers);
      
      expect(balances).toHaveLength(3);
      
      // Alice: paid 60€ for 3 people (20€ each), paid 0€ for transport, owes 15€ for transport
      // Balance: +60 - 20 - 15 = +25€
      expect(balances.find(b => b.userId === '1')?.balance).toBe(25);
      
      // Bob: paid 0€ for restaurant, paid 30€ for 2 people (15€ each)
      // Balance: -20 + 30 - 15 = -5€
      expect(balances.find(b => b.userId === '2')?.balance).toBe(-5);
      
      // Charlie: paid 0€ for restaurant, not involved in transport
      // Balance: -20 + 0 = -20€
      expect(balances.find(b => b.userId === '3')?.balance).toBe(-20);
    });

    it('should return zero balances when no expenses', () => {
      const balances = calculateBalances([], mockUsers);
      
      expect(balances).toHaveLength(3);
      balances.forEach(balance => {
        expect(balance.balance).toBe(0);
      });
    });

    it('should handle expenses with single payer and beneficiary', () => {
      const singleExpense: Expense[] = [
        {
          id: '1',
          groupId: 'group1',
          amount: 100,
          description: 'Test',
          paidBy: '1',
          paidFor: ['1'],
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const balances = calculateBalances(singleExpense, mockUsers);
      
      // Alice should have 0 balance (paid 100€ for herself)
      expect(balances.find(b => b.userId === '1')?.balance).toBe(0);
      
      // Others should have 0 balance (not involved)
      expect(balances.find(b => b.userId === '2')?.balance).toBe(0);
      expect(balances.find(b => b.userId === '3')?.balance).toBe(0);
    });
  });

  describe('calculateSettlements', () => {
    it('should calculate optimal settlements', () => {
      const balances: Balance[] = [
        { userId: '1', userName: 'Alice', balance: 50 },
        { userId: '2', userName: 'Bob', balance: -30 },
        { userId: '3', userName: 'Charlie', balance: -20 },
      ];

      const settlements = calculateSettlements(balances);
      
      expect(settlements).toHaveLength(2);
      
      // Bob should pay 30€ to Alice
      expect(settlements).toContainEqual({
        from: '2',
        to: '1',
        amount: 30,
      });
      
      // Charlie should pay 20€ to Alice
      expect(settlements).toContainEqual({
        from: '3',
        to: '1',
        amount: 20,
      });
    });

    it('should handle balanced scenario', () => {
      const balances: Balance[] = [
        { userId: '1', userName: 'Alice', balance: 0 },
        { userId: '2', userName: 'Bob', balance: 0 },
      ];

      const settlements = calculateSettlements(balances);
      
      expect(settlements).toHaveLength(0);
    });

    it('should ignore very small amounts', () => {
      const balances: Balance[] = [
        { userId: '1', userName: 'Alice', balance: 0.005 },
        { userId: '2', userName: 'Bob', balance: -0.005 },
      ];

      const settlements = calculateSettlements(balances);
      
      expect(settlements).toHaveLength(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly for French locale', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toMatch(/1\s*234,56\s*€/);
      expect(formatCurrency(0)).toMatch(/0,00\s*€/);
      expect(formatCurrency(100)).toMatch(/100,00\s*€/);
      expect(formatCurrency(0.99)).toMatch(/0,99\s*€/);
    });

    it('should handle negative amounts', () => {
      const formatted = formatCurrency(-1234.56);
      expect(formatted).toMatch(/-\s*1\s*234,56\s*€/);
    });
  });

  describe('getTotalExpenses', () => {
    it('should calculate total expenses correctly', () => {
      const total = getTotalExpenses(mockExpenses);
      expect(total).toBe(90); // 60 + 30
    });

    it('should return 0 for empty expenses', () => {
      const total = getTotalExpenses([]);
      expect(total).toBe(0);
    });
  });

  describe('getExpensesByUser', () => {
    it('should return expenses where user is payer or beneficiary', () => {
      const aliceExpenses = getExpensesByUser(mockExpenses, '1');
      expect(aliceExpenses).toHaveLength(2); // Both expenses involve Alice
      
      const charlieExpenses = getExpensesByUser(mockExpenses, '3');
      expect(charlieExpenses).toHaveLength(1); // Only restaurant expense
    });

    it('should return empty array for user not involved in any expense', () => {
      const expenses = getExpensesByUser(mockExpenses, '999');
      expect(expenses).toHaveLength(0);
    });
  });

  describe('getTotalPaidByUser', () => {
    it('should calculate total amount paid by user', () => {
      const aliceTotal = getTotalPaidByUser(mockExpenses, '1');
      expect(aliceTotal).toBe(60); // Only restaurant expense
      
      const bobTotal = getTotalPaidByUser(mockExpenses, '2');
      expect(bobTotal).toBe(30); // Only transport expense
      
      const charlieTotal = getTotalPaidByUser(mockExpenses, '3');
      expect(charlieTotal).toBe(0); // Never paid
    });
  });

  describe('getTotalOwedByUser', () => {
    it('should calculate total amount owed by user', () => {
      const aliceOwed = getTotalOwedByUser(mockExpenses, '1');
      expect(aliceOwed).toBe(35); // 20€ for restaurant + 15€ for transport
      
      const bobOwed = getTotalOwedByUser(mockExpenses, '2');
      expect(bobOwed).toBe(35); // 20€ for restaurant + 15€ for transport
      
      const charlieOwed = getTotalOwedByUser(mockExpenses, '3');
      expect(charlieOwed).toBe(20); // Only 20€ for restaurant
    });
  });
}); 