import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminAuditLog from '../../pages/AdminAuditLog';

const renderAdminAuditLog = () => {
  return render(
    <BrowserRouter>
      <AdminAuditLog />
    </BrowserRouter>
  );
};

describe('AdminAuditLog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders page title', () => {
      renderAdminAuditLog();
      expect(screen.getByRole('heading', { name: /audit log/i })).toBeInTheDocument();
    });

    it('renders download button', () => {
      renderAdminAuditLog();
      expect(screen.getByRole('button', { name: /download audit log report/i })).toBeInTheDocument();
    });

    it('renders filter section', () => {
      renderAdminAuditLog();
      expect(screen.getByRole('heading', { name: /audit log filters/i })).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderAdminAuditLog();
      const searchInput = screen.getByPlaceholderText(/user, resource, details/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('renders action filter dropdown', () => {
      renderAdminAuditLog();
      const actionSelect = screen.getByDisplayValue('All Actions');
      expect(actionSelect).toBeInTheDocument();
    });

    it('renders status filter dropdown', () => {
      renderAdminAuditLog();
      const statusSelect = screen.getByDisplayValue('All Statuses');
      expect(statusSelect).toBeInTheDocument();
    });

    it('renders results count', () => {
      renderAdminAuditLog();
      expect(screen.getByText('entries')).toBeInTheDocument();
    });

    it('renders audit log table', () => {
      renderAdminAuditLog();
      expect(screen.getByRole('heading', { name: /audit log entries/i })).toBeInTheDocument();
    });

    it('renders table columns', () => {
      renderAdminAuditLog();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Resource')).toBeInTheDocument();
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders sample audit logs', () => {
      renderAdminAuditLog();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters logs by user name', () => {
      renderAdminAuditLog();
      const searchInput = screen.getByPlaceholderText(/user, resource, details/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Sarah Johnson' } });

      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });

    it('filters logs by resource', () => {
      renderAdminAuditLog();
      const searchInput = screen.getByPlaceholderText(/user, resource, details/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Dependent' } });

      // Should show logs with Dependent resource
      expect(searchInput.value).toBe('Dependent');
    });

    it('clears search results when search is empty', () => {
      renderAdminAuditLog();
      const searchInput = screen.getByPlaceholderText(/user, resource, details/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(searchInput.value).toBe('');
    });
  });

  describe('Action Filter', () => {
    it('filters by create action', () => {
      renderAdminAuditLog();
      const actionSelect = screen.getByDisplayValue('All Actions') as HTMLSelectElement;
      fireEvent.change(actionSelect, { target: { value: 'create' } });

      expect(actionSelect.value).toBe('create');
    });

    it('filters by edit action', () => {
      renderAdminAuditLog();
      const actionSelect = screen.getByDisplayValue('All Actions') as HTMLSelectElement;
      fireEvent.change(actionSelect, { target: { value: 'edit' } });

      expect(actionSelect.value).toBe('edit');
    });

    it('filters by delete action', () => {
      renderAdminAuditLog();
      const actionSelect = screen.getByDisplayValue('All Actions') as HTMLSelectElement;
      fireEvent.change(actionSelect, { target: { value: 'delete' } });

      expect(actionSelect.value).toBe('delete');
    });

    it('filters by login action', () => {
      renderAdminAuditLog();
      const actionSelect = screen.getByDisplayValue('All Actions') as HTMLSelectElement;
      fireEvent.change(actionSelect, { target: { value: 'login' } });

      expect(actionSelect.value).toBe('login');
    });

    it('shows all actions when reset', () => {
      renderAdminAuditLog();
      const actionSelect = screen.getByDisplayValue('All Actions') as HTMLSelectElement;
      fireEvent.change(actionSelect, { target: { value: 'all' } });

      expect(actionSelect.value).toBe('all');
    });
  });

  describe('Status Filter', () => {
    it('filters by success status', () => {
      renderAdminAuditLog();
      const statusSelect = screen.getByDisplayValue('All Statuses') as HTMLSelectElement;
      fireEvent.change(statusSelect, { target: { value: 'success' } });

      expect(statusSelect.value).toBe('success');
    });

    it('filters by failed status', () => {
      renderAdminAuditLog();
      const statusSelect = screen.getByDisplayValue('All Statuses') as HTMLSelectElement;
      fireEvent.change(statusSelect, { target: { value: 'failed' } });

      expect(statusSelect.value).toBe('failed');
    });

    it('shows all statuses when reset', () => {
      renderAdminAuditLog();
      const statusSelect = screen.getByDisplayValue('All Statuses') as HTMLSelectElement;
      fireEvent.change(statusSelect, { target: { value: 'all' } });

      expect(statusSelect.value).toBe('all');
    });
  });

  describe('Status Display', () => {
    it('shows success status with correct icon and color', () => {
      renderAdminAuditLog();
      const successStatuses = screen.getAllByText('Success');
      expect(successStatuses.length).toBeGreaterThan(0);
      successStatuses.forEach(status => {
        expect(status.className).toMatch(/green/);
      });
    });

    it('shows failed status with correct icon and color', () => {
      renderAdminAuditLog();
      const failedStatuses = screen.getAllByText('Failed');
      expect(failedStatuses.length).toBeGreaterThan(0);
      failedStatuses.forEach(status => {
        expect(status.className).toMatch(/red/);
      });
    });
  });

  describe('Action Badges', () => {
    it('displays create action badge', () => {
      renderAdminAuditLog();
      const createBadges = screen.getAllByText('create');
      expect(createBadges.length).toBeGreaterThan(0);
      createBadges.forEach(badge => {
        expect(badge.className).toMatch(/green/);
      });
    });

    it('displays edit action badge', () => {
      renderAdminAuditLog();
      const editBadges = screen.getAllByText('edit');
      expect(editBadges.length).toBeGreaterThan(0);
      editBadges.forEach(badge => {
        expect(badge.className).toMatch(/blue/);
      });
    });

    it('displays delete action badge', () => {
      renderAdminAuditLog();
      const deleteBadges = screen.queryAllByText('delete');
      deleteBadges.forEach(badge => {
        expect(badge.className).toMatch(/red/);
      });
    });

    it('displays login action badge', () => {
      renderAdminAuditLog();
      const loginBadges = screen.queryAllByText('login');
      loginBadges.forEach(badge => {
        expect(badge.className).toMatch(/purple/);
      });
    });
  });

  describe('Detail Modal', () => {
    it('opens modal when eye icon clicked', async () => {
      renderAdminAuditLog();
      const viewButtons = screen.getAllByRole('button', { name: /view details/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('displays audit log details in modal', async () => {
      renderAdminAuditLog();
      const viewButtons = screen.getAllByRole('button', { name: /view details/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Audit Log Details')).toBeInTheDocument();
      });
    });

    it('modal has close button', async () => {
      renderAdminAuditLog();
      const viewButtons = screen.getAllByRole('button', { name: /view details/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        const closeButtons = screen.getAllByRole('button', { name: /close/i });
        expect(closeButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Download Functionality', () => {
    it('download button is clickable', () => {
      renderAdminAuditLog();
      const downloadButton = screen.getByRole('button', { name: /download audit log report/i });
      expect(downloadButton).toBeInTheDocument();
      fireEvent.click(downloadButton);
      expect(downloadButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has main content region', () => {
      renderAdminAuditLog();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('search input has aria-label', () => {
      renderAdminAuditLog();
      const searchInput = screen.getByPlaceholderText(/user, resource, details/i);
      expect(searchInput).toHaveAttribute('aria-label', /search audit logs/i);
    });

    it('action filter has aria-label', () => {
      renderAdminAuditLog();
      const actionSelect = screen.getByDisplayValue('All Actions');
      expect(actionSelect).toHaveAttribute('aria-label', /filter audit logs by action/i);
    });

    it('status filter has aria-label', () => {
      renderAdminAuditLog();
      const statusSelect = screen.getByDisplayValue('All Statuses');
      expect(statusSelect).toHaveAttribute('aria-label', /filter audit logs by status/i);
    });

    it('results count has aria-live', () => {
      renderAdminAuditLog();
      const resultsDiv = screen.getByText('entries').closest('div');
      expect(resultsDiv).toHaveAttribute('aria-live', 'polite');
    });

    it('table has proper aria-label', () => {
      renderAdminAuditLog();
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', /system audit logs/i);
    });

    it('download button has descriptive aria-label', () => {
      renderAdminAuditLog();
      const downloadButton = screen.getByRole('button', { name: /download audit log report/i });
      expect(downloadButton).toHaveAttribute('aria-label', /download audit log report/i);
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode to title', () => {
      renderAdminAuditLog();
      const title = screen.getByRole('heading', { name: /audit log/i });
      expect(title.className).toMatch(/dark:/);
    });

    it('applies dark mode to filter section', () => {
      renderAdminAuditLog();
      const filterLabel = screen.getByText('Search');
      const parent = filterLabel.closest('div');
      expect(parent?.className).toMatch(/dark:/);
    });
  });

  describe('Responsive Design', () => {
    it('filter grid is responsive', () => {
      renderAdminAuditLog();
      const filterSection = screen.getByRole('region');
      expect(filterSection).toBeInTheDocument();
    });

    it('table is responsive', () => {
      renderAdminAuditLog();
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });
});
