import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// Mock the components to avoid complex setup
jest.mock('./components/GroupList', () => {
  return function MockGroupList() {
    return <div data-testid="group-list">Group List</div>;
  };
});

jest.mock('./components/GroupDetail', () => {
  return function MockGroupDetail() {
    return <div data-testid="group-detail">Group Detail</div>;
  };
});

jest.mock('./components/CreateGroupModal', () => {
  return function MockCreateGroupModal() {
    return <div data-testid="create-group-modal">Create Group Modal</div>;
  };
});

describe('App', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  it('should render the main title', () => {
    renderApp();
    
    expect(screen.getByText('💳 Sumeria Expense Tracker')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    renderApp();
    
    expect(screen.getByText('Gérez vos remboursements entre amis simplement')).toBeInTheDocument();
  });

  it('should render the groups section', () => {
    renderApp();
    
    expect(screen.getByText('Mes Groupes')).toBeInTheDocument();
  });

  it('should render the create group button', () => {
    renderApp();
    
    expect(screen.getByText('+ Créer un groupe')).toBeInTheDocument();
  });

  it('should render the create group modal', () => {
    renderApp();
    
    expect(screen.getByTestId('create-group-modal')).toBeInTheDocument();
  });
}); 