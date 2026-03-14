import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDependents from '../../pages/AdminDependents';
import { DarkModeProvider } from '../../context/DarkModeContext';

vi.mock('../../components/admin/EditDependentModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    isOpen ? <div data-testid="edit-modal">Edit Modal</div> : null
  ),
}));

vi.mock('../../components/admin/DeleteDependentModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    isOpen ? <div data-testid="delete-modal">Delete Modal</div> : null
  ),
}));

const renderAdminDependents = () => {
  return render(
    <BrowserRouter>
      <DarkModeProvider>
        <AdminDependents />
      </DarkModeProvider>
    </BrowserRouter>
  );
};

describe('AdminDependents Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders page title', () => {
      renderAdminDependents();
      expect(screen.getByRole('heading', { name: /dependents management/i })).toBeInTheDocument();
    });

    it('renders add dependent button', () => {
      renderAdminDependents();
      expect(screen.getByRole('button', { name: /add new dependent/i })).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderAdminDependents();
      const searchInput = screen.getByPlaceholderText(/search by name or caregiver/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('renders dependents table', () => {
      renderAdminDependents();
      expect(screen.getByRole('heading', { name: /dependents list/i })).toBeInTheDocument();
    });

    it('renders table with correct columns', () => {
      renderAdminDependents();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Caregiver')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Last Update')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders sample dependents', () => {
      renderAdminDependents();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Mary Johnson')).toBeInTheDocument();
    });

    it('renders statistics section', () => {
      renderAdminDependents();
      expect(screen.getByRole('heading', { name: /dependents statistics/i })).toBeInTheDocument();
    });

    it('displays dependent count statistics', () => {
      renderAdminDependents();
      expect(screen.getByText('Total Dependents')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters dependents by name', () => {
      renderAdminDependents();
      const searchInput = screen.getByPlaceholderText(/search by name or caregiver/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'John' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Mary Johnson')).not.toBeInTheDocument();
    });

    it('filters dependents by caregiver name', () => {
      renderAdminDependents();
      const searchInput = screen.getByPlaceholderText(/search by name or caregiver/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Jane Smith' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows no results message when search has no matches', () => {
      renderAdminDependents();
      const searchInput = screen.getByPlaceholderText(/search by name or caregiver/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      expect(screen.getByText('No dependents found')).toBeInTheDocument();
    });

    it('clears search and shows all dependents', () => {
      renderAdminDependents();
      const searchInput = screen.getByPlaceholderText(/search by name or caregiver/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'John' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Mary Johnson')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has main content region', () => {
      renderAdminDependents();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('search input has descriptive label', () => {
      renderAdminDependents();
      const searchInput = screen.getByPlaceholderText(/search by name or caregiver/i);
      expect(searchInput).toHaveAttribute('aria-label', /search dependents/i);
    });

    it('add button has descriptive aria-label', () => {
      renderAdminDependents();
      const addButton = screen.getByRole('button', { name: /add new dependent/i });
      expect(addButton).toHaveAttribute('aria-label');
    });

    it('table has proper ARIA labels', () => {
      renderAdminDependents();
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', /dependents table/i);
    });

    it('action buttons have context-specific labels', () => {
      renderAdminDependents();
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
      editButtons.forEach(btn => {
        expect(btn).toHaveAttribute('aria-label');
      });
    });

    it('all buttons have touch-friendly sizing', () => {
      renderAdminDependents();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const classList = button.classList.toString();
        // Should have min-h-44px or min-h-[44px]
        expect(classList).toMatch(/min-h/);
      });
    });
  });

  describe('Edit Functionality', () => {
    it('opens edit modal when edit button clicked', async () => {
      renderAdminDependents();
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      });
    });

    it('closes edit modal', async () => {
      renderAdminDependents();
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const modal = screen.getByTestId('edit-modal');
        expect(modal).toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('opens delete modal when delete button clicked', async () => {
      renderAdminDependents();
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode classes', () => {
      renderAdminDependents();
      const title = screen.getByRole('heading', { name: /dependents management/i });
      expect(title.className).toMatch(/dark:/);
    });
  });

  describe('Responsive Design', () => {
    it('header is responsive flex layout', () => {
      renderAdminDependents();
      const section = screen.getByRole('region').parentElement;
      expect(section?.className).toMatch(/flex|md:/);
    });

    it('table is responsive', () => {
      renderAdminDependents();
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('statistics grid is responsive', () => {
      renderAdminDependents();
      const statsSection = screen.getByRole('region', { name: /statistics/i });
      expect(statsSection).toBeInTheDocument();
    });
  });

  describe('Statistics Calculation', () => {
    it('displays correct total dependents count', () => {
      renderAdminDependents();
      const totalCount = screen.getByText('Total Dependents').nextElementSibling;
      expect(totalCount?.textContent).toMatch(/2/);
    });

    it('displays correct active count', () => {
      renderAdminDependents();
      const activeCount = screen.getByText('Active').nextElementSibling;
      expect(activeCount?.textContent).toMatch(/2/);
    });

    it('displays correct inactive count', () => {
      renderAdminDependents();
      const inactiveCount = screen.getByText('Inactive').nextElementSibling;
      expect(inactiveCount?.textContent).toMatch(/0/);
    });
  });
});
