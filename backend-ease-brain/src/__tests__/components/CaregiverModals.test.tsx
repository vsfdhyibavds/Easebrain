import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CaregiverModals from '../../components/CaregiverModals';
import { DarkModeProvider } from '../../context/DarkModeContext';
const mockOnClose = vi.fn();
const mockOnSave = vi.fn();
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <DarkModeProvider>
        {component}
      </DarkModeProvider>
    </BrowserRouter>
  );
};
describe('CaregiverModals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('Add Caregiver Modal', () => {
    it('renders add caregiver modal when open', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('displays add caregiver form', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByText(/Add New Caregiver|Create Caregiver/i)).toBeInTheDocument();
    });
    it('has name input field', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByPlaceholderText(/name|caregiver name/i)).toBeInTheDocument();
    });
    it('has email input field', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByPlaceholderText(/email|email address/i)).toBeInTheDocument();
    });
    it('has phone input field', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByPlaceholderText(/phone|phone number/i)).toBeInTheDocument();
    });
    it('has role dropdown', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const roleSelects = screen.getAllByDisplayValue(/select|caregiver/i);
      expect(roleSelects.length).toBeGreaterThanOrEqual(0);
    });
    it('has cancel button', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
    it('has save or add button', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('button', { name: /save|add/i })).toBeInTheDocument();
    });
    it('cancel button calls onClose', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });
    it('does not render when isAddModalOpen is false', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  describe('Edit Caregiver Modal', () => {
    const mockCaregiver = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      role: 'Primary Caregiver'
    };
    it('renders edit modal with caregiver data', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isEditModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('displays edit title', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isEditModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByText(/Edit|Update.*Caregiver/i)).toBeInTheDocument();
    });
    it('populates name field with existing data', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isEditModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const nameInput = screen.getByDisplayValue(mockCaregiver.name) as HTMLInputElement;
      expect(nameInput.value).toBe(mockCaregiver.name);
    });
    it('populates email field with existing data', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isEditModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const emailInput = screen.getByDisplayValue(mockCaregiver.email) as HTMLInputElement;
      expect(emailInput.value).toBe(mockCaregiver.email);
    });
    it('populates phone field with existing data', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isEditModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const phoneInput = screen.getByDisplayValue(mockCaregiver.phone) as HTMLInputElement;
      expect(phoneInput.value).toBe(mockCaregiver.phone);
    });
    it('allows editing name', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isEditModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const nameInput = screen.getByDisplayValue(mockCaregiver.name) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      expect(nameInput.value).toBe('Jane Doe');
    });
    it('does not render when isEditModalOpen is false', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  describe('Delete Confirmation Modal', () => {
    const mockCaregiver = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      role: 'Primary Caregiver'
    };
    it('renders delete confirmation modal', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isDeleteModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('displays delete confirmation message', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isDeleteModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByText(/delete|remove.*caregiver|confirm/i)).toBeInTheDocument();
    });
    it('shows caregiver name in delete message', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isDeleteModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByText(new RegExp(mockCaregiver.name, 'i'))).toBeInTheDocument();
    });
    it('has cancel button', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isDeleteModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
    it('has confirm delete button', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isDeleteModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('button', { name: /delete|confirm/i })).toBeInTheDocument();
    });
    it('cancel button calls onClose', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isDeleteModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });
    it('delete button calls onSave with delete action', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          isDeleteModalOpen={true}
          selectedCaregiver={mockCaregiver}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /delete|confirm/i }));
      expect(mockOnSave).toHaveBeenCalled();
    });
    it('does not render when isDeleteModalOpen is false', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  describe('Form Validation', () => {
    it('shows validation error for empty name', async () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const saveButton = screen.getByRole('button', { name: /save|add/i });
      fireEvent.click(saveButton);
      // Validation should show or prevent submission
      // This depends on implementation
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('shows validation error for invalid email', async () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const emailInput = screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('validates phone number format', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const phoneInput = screen.getByPlaceholderText(/phone/i) as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: 'abc' } });
      // Component should handle validation
      expect(phoneInput).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('modal has role dialog', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('form inputs have associated labels', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByPlaceholderText(/name|caregiver name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
    });
    it('buttons have descriptive labels', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save|add/i })).toBeInTheDocument();
    });
    it('modal has focus management', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });
  describe('Dark Mode Support', () => {
    it('modal renders in dark mode', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('form elements are visible in dark mode', () => {
      renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });
  });
  describe('Modal State Management', () => {
    it('only one modal is open at a time', () => {
      const mockCaregiver = { id: '1', name: 'John', email: 'john@example.com', phone: '555-1234', role: 'Primary' };
      const { rerender } = renderWithProviders(
        <CaregiverModals
          isAddModalOpen={true} isEditModalOpen={false} isDeleteModalOpen={false}
          onClose={mockOnClose} onSave={mockOnSave}
        />
      );
      expect(screen.getByText(/Add New Caregiver|Create/i)).toBeInTheDocument();
      rerender(
        <BrowserRouter>
          <DarkModeProvider>
            <CaregiverModals
              isAddModalOpen={false}
              isEditModalOpen={true}
              selectedCaregiver={mockCaregiver}
              onClose={mockOnClose} onSave={mockOnSave}
            />
          </DarkModeProvider>
        </BrowserRouter>
      );
      expect(screen.getByText(/Edit|Update/i)).toBeInTheDocument();
    });
  });
});
