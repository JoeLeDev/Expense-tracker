import React from 'react';
import { render, screen } from '@testing-library/react';
import BalanceSummary from '../BalanceSummary';
import { Balance } from '../../types';

describe('BalanceSummary', () => {
  const mockBalances: Balance[] = [
    { userId: '1', userName: 'Alice', balance: 25.50 },
    { userId: '2', userName: 'Bob', balance: -15.25 },
    { userId: '3', userName: 'Charlie', balance: -10.25 },
  ];

  it('should render balance summary with correct title', () => {
    render(<BalanceSummary balances={mockBalances} />);
    
    expect(screen.getByText('Soldes des membres')).toBeInTheDocument();
  });

  it('should render all users with their balances', () => {
    render(<BalanceSummary balances={mockBalances} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    
    // Check that amounts are formatted correctly
    expect(screen.getByText('25,50 €')).toBeInTheDocument();
    expect(screen.getByText('15,25 €')).toBeInTheDocument();
    expect(screen.getByText('10,25 €')).toBeInTheDocument();
  });

  it('should display correct balance status for each user', () => {
    render(<BalanceSummary balances={mockBalances} />);
    
    // Alice has positive balance (is owed money)
    expect(screen.getByText('est dû')).toBeInTheDocument();
    
    // Bob and Charlie have negative balances (owe money)
    expect(screen.getAllByText('doit')).toHaveLength(2);
  });

  it('should sort balances by amount (highest first)', () => {
    render(<BalanceSummary balances={mockBalances} />);
    
    const balanceItems = screen.getAllByTestId('balance-item');
    
    // Should be sorted: Alice (25.50), Bob (-15.25), Charlie (-10.25)
    // But since we sort by b.balance - a.balance, it's actually:
    // Alice (25.50), Charlie (-10.25), Bob (-15.25)
    expect(balanceItems[0]).toHaveTextContent('Alice');
    expect(balanceItems[1]).toHaveTextContent('Charlie');
    expect(balanceItems[2]).toHaveTextContent('Bob');
  });

  it('should handle empty balances array', () => {
    render(<BalanceSummary balances={[]} />);
    
    expect(screen.getByText('Soldes des membres')).toBeInTheDocument();
    expect(screen.queryByTestId('balance-item')).not.toBeInTheDocument();
  });

  it('should handle zero balance correctly', () => {
    const zeroBalance: Balance[] = [
      { userId: '1', userName: 'Alice', balance: 0 },
    ];
    
    render(<BalanceSummary balances={zeroBalance} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('0,00 €')).toBeInTheDocument();
    expect(screen.getByText('équilibré')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for balance amounts', () => {
    render(<BalanceSummary balances={mockBalances} />);
    
    // Positive balance should have 'positive' class
    const positiveAmount = screen.getByText('25,50 €');
    expect(positiveAmount).toHaveClass('positive');
    
    // Negative balances should have 'negative' class
    const negativeAmounts = screen.getAllByText(/15,25 €|10,25 €/);
    negativeAmounts.forEach(amount => {
      expect(amount).toHaveClass('negative');
    });
  });
}); 