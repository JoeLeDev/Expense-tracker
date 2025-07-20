import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExportModal from '../ExportModal';
import { Group, Expense, User } from '../../types';
import * as notifyModule from '../../hooks/notify';

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

// Mock des utilitaires d'export
jest.mock('../../utils/exportUtils', () => ({
  exportToPDF: jest.fn(),
  exportToCSV: jest.fn(),
  exportGroupData: jest.fn()
}));

jest.mock('../../hooks/notify');
const mockNotify = notifyModule.notify as jest.Mock;

const mockGroup: Group = {
  id: '1',
  name: 'Test Group',
  description: 'Test Description',
  members: [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' }
  ],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

const mockExpenses: Expense[] = [
  {
    id: '1',
    groupId: '1',
    amount: 50,
    description: 'Restaurant',
    paidBy: '1',
    paidFor: ['1', '2'],
    date: new Date('2025-01-01'),
    category: 'Food',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: '2',
    groupId: '1',
    amount: 30,
    description: 'Transport',
    paidBy: '2',
    paidFor: ['1', '2'],
    date: new Date('2025-01-01'),
    category: 'Transport',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

const mockUsers: User[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' }
];

describe('ExportModal', () => {
  const mockOnClose = jest.fn();
  let mockExportToPDF: jest.Mock;
  let mockExportToCSV: jest.Mock;
  let mockExportGroupData: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const exportUtils = require('../../utils/exportUtils');
    mockExportToPDF = exportUtils.exportToPDF as jest.Mock;
    mockExportToCSV = exportUtils.exportToCSV as jest.Mock;
    mockExportGroupData = exportUtils.exportGroupData as jest.Mock;
  });

  it('should not render when isOpen is false', () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={false}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    expect(screen.queryByText('Exporter les données')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    expect(screen.getByText('Exporter les données')).toBeInTheDocument();
    expect(screen.getByText('Résumé du groupe')).toBeInTheDocument();
    expect(screen.getByText('Options d\'export')).toBeInTheDocument();
  });

  it('should display group summary correctly', () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // 2 membres et 2 dépenses
    expect(screen.getByText('80.00 €')).toBeInTheDocument(); // Total des dépenses
  });

  it('should display export options', () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    expect(screen.getByText('📄 Export PDF')).toBeInTheDocument();
    expect(screen.getByText('📊 Export CSV')).toBeInTheDocument();
    expect(screen.getByText('📦 Export complet')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle PDF export', () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    fireEvent.click(screen.getByText('Exporter en PDF'));
    
    // Vérifier que le modal se ferme après l'export
    expect(mockOnClose).toHaveBeenCalled();
    
    mockAlert.mockRestore();
  });

  it('should handle CSV export', () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    fireEvent.click(screen.getByText('Exporter en CSV'));
    
    // Vérifier que le modal se ferme après l'export
    expect(mockOnClose).toHaveBeenCalled();
    
    mockAlert.mockRestore();
  });

  it('should handle complete export', () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );

    fireEvent.click(screen.getByText('Exporter tout'));
    
    // Vérifier que exportGroupData a été appelé
    expect(mockExportGroupData).toHaveBeenCalledWith(mockGroup, mockExpenses, mockUsers);
    
    // Vérifier que le modal se ferme après l'export
    expect(mockOnClose).toHaveBeenCalled();
    
    mockAlert.mockRestore();
  });

  it('should handle export errors gracefully', async () => {
    mockExportGroupData.mockImplementation(() => { throw new Error('Export error'); });
    renderWithQueryClient(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        group={mockGroup}
        expenses={mockExpenses}
        users={mockUsers}
      />
    );
    fireEvent.click(screen.getByText('Exporter tout'));
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erreur',
          description: "Erreur lors de l'export complet",
          status: 'error',
        })
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled(); // Le modal ne se ferme pas en cas d'erreur
  });
}); 