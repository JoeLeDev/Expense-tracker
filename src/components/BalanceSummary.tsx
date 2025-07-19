import React from 'react';
import { Balance } from '../types';
import { formatCurrency } from '../utils/balanceCalculator';

interface BalanceSummaryProps {
  balances: Balance[];
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ balances }) => {
  const sortedBalances = [...balances].sort((a, b) => b.balance - a.balance);

  return (
    <div className="balance-summary">
      <h3>Soldes des membres</h3>
      <div className="balance-list">
        {sortedBalances.map((balance) => (
          <div key={balance.userId} className="balance-item" data-testid="balance-item">
            <div className="balance-user">
              <span className="user-name">{balance.userName}</span>
            </div>
            <div className="balance-amount">
              <span className={`amount ${balance.balance > 0 ? 'positive' : balance.balance < 0 ? 'negative' : 'neutral'}`}>
                {formatCurrency(Math.abs(balance.balance))}
              </span>
              <span className="balance-status">
                {balance.balance > 0 ? 'est dû' : balance.balance < 0 ? 'doit' : 'équilibré'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalanceSummary; 