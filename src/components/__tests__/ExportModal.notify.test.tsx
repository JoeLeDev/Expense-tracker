import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as notifyModule from '../../hooks/notify';
import ExportModal from '../ExportModal';

jest.mock('../../hooks/notify');
const mockNotify = notifyModule.notify as jest.Mock;

jest.mock('../../utils/exportUtils', () => ({
  exportToPDF: jest.fn(),
  exportToCSV: jest.fn(),
  exportGroupData: jest.fn(),
}));

describe('ExportModal (notifications)', () => {
  const baseGroup = {
    id: '1',
    name: 'Groupe Test',
    description: 'desc',
    members: [
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const baseExpenses = [
    {
      id: 'e1',
      groupId: '1',
      amount: 10,
      description: 'Pain',
      paidBy: 'u1',
      paidFor: ['u1', 'u2'],
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      category: 'Food'
    }
  ];
  const baseUsers = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' }
  ];

  const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('notifie lors de l\'export PDF', async () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        group={baseGroup}
        expenses={baseExpenses}
        users={baseUsers}
      />
    );
    fireEvent.click(screen.getByText('Exporter en PDF'));
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Export PDF',
          status: 'success',
        })
      );
    });
  });

  it('notifie lors de l\'export CSV', async () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        group={baseGroup}
        expenses={baseExpenses}
        users={baseUsers}
      />
    );
    fireEvent.click(screen.getByText('Exporter en CSV'));
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Export CSV',
          status: 'success',
        })
      );
    });
  });

  it('notifie lors de l\'export complet', async () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        group={baseGroup}
        expenses={baseExpenses}
        users={baseUsers}
      />
    );
    fireEvent.click(screen.getByText('Exporter tout'));
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Export complet',
          status: 'success',
        })
      );
    });
  });
}); 