import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminTasks from '../../pages/AdminTasks';
import { DarkModeProvider } from '../../context/DarkModeContext';

const renderAdminTasks = () => {
  return render(
    <BrowserRouter>
      <DarkModeProvider>
        <AdminTasks />
      </DarkModeProvider>
    </BrowserRouter>
  );
};

describe('AdminTasks Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders page title', () => {
      renderAdminTasks();
      expect(screen.getByRole('heading', { name: /care tasks/i })).toBeInTheDocument();
    });

    it('renders create task button', () => {
      renderAdminTasks();
      expect(screen.getByRole('button', { name: /create new care task/i })).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderAdminTasks();
      const searchInput = screen.getByPlaceholderText(/search by task or dependent/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('renders tasks table', () => {
      renderAdminTasks();
      expect(screen.getByRole('heading', { name: /care tasks list/i })).toBeInTheDocument();
    });

    it('renders table columns', () => {
      renderAdminTasks();
      expect(screen.getByText('Task')).toBeInTheDocument();
      expect(screen.getByText('Dependent')).toBeInTheDocument();
      expect(screen.getByText('Assigned To')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders sample tasks', () => {
      renderAdminTasks();
      expect(screen.getByText('Morning Medication')).toBeInTheDocument();
      expect(screen.getByText('Physical Therapy')).toBeInTheDocument();
      expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
    });

    it('renders statistics cards', () => {
      renderAdminTasks();
      expect(screen.getByRole('heading', { name: /task statistics/i })).toBeInTheDocument();
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters tasks by title', () => {
      renderAdminTasks();
      const searchInput = screen.getByPlaceholderText(/search by task or dependent/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Medication' } });

      expect(screen.getByText('Morning Medication')).toBeInTheDocument();
      expect(screen.queryByText('Physical Therapy')).not.toBeInTheDocument();
    });

    it('filters tasks by dependent name', () => {
      renderAdminTasks();
      const searchInput = screen.getByPlaceholderText(/search by task or dependent/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'John Doe' } });

      expect(screen.getByText('Morning Medication')).toBeInTheDocument();
      expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
    });

    it('shows all tasks when search is cleared', () => {
      renderAdminTasks();
      const searchInput = screen.getByPlaceholderText(/search by task or dependent/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('Morning Medication')).toBeInTheDocument();
      expect(screen.getByText('Physical Therapy')).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('displays total tasks count', () => {
      renderAdminTasks();
      const totalText = screen.getByText('Total Tasks').nextElementSibling;
      expect(totalText?.textContent).toMatch(/3/);
    });

    it('displays completed tasks count', () => {
      renderAdminTasks();
      const completedText = screen.getByText('Completed').nextElementSibling;
      expect(completedText?.textContent).toMatch(/1/);
    });

    it('displays pending tasks count', () => {
      renderAdminTasks();
      const pendingText = screen.getByText('Pending').nextElementSibling;
      expect(pendingText?.textContent).toMatch(/2/);
    });

    it('displays high priority tasks count', () => {
      renderAdminTasks();
      const highPriorityText = screen.getByText('High Priority').nextElementSibling;
      expect(highPriorityText?.textContent).toMatch(/2/);
    });
  });

  describe('Task Display', () => {
    it('shows task priority badges', () => {
      renderAdminTasks();
      const priorityBadges = screen.getAllByText(/High|Medium|Low/);
      expect(priorityBadges.length).toBeGreaterThan(0);
    });

    it('shows task status', () => {
      renderAdminTasks();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows due dates', () => {
      renderAdminTasks();
      expect(screen.getByText('2025-02-01')).toBeInTheDocument();
      expect(screen.getByText('2025-02-02')).toBeInTheDocument();
      expect(screen.getByText('2025-02-03')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has main content region', () => {
      renderAdminTasks();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('search input has aria-label', () => {
      renderAdminTasks();
      const searchInput = screen.getByPlaceholderText(/search by task or dependent/i);
      expect(searchInput).toHaveAttribute('aria-label', /search tasks/i);
    });

    it('create button has descriptive aria-label', () => {
      renderAdminTasks();
      const createButton = screen.getByRole('button', { name: /create new care task/i });
      expect(createButton).toHaveAttribute('aria-label');
    });

    it('table has aria-label', () => {
      renderAdminTasks();
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', /care tasks table/i);
    });

    it('action buttons have context labels', () => {
      renderAdminTasks();
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
      editButtons.forEach(btn => {
        expect(btn).toHaveAttribute('aria-label');
      });
    });

    it('stats section has heading tag', () => {
      renderAdminTasks();
      expect(screen.getByRole('heading', { name: /task statistics/i })).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('edit button is clickable', () => {
      renderAdminTasks();
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons[0]).toBeInTheDocument();
      fireEvent.click(editButtons[0]);
      expect(editButtons[0]).toBeInTheDocument();
    });

    it('delete button is clickable', () => {
      renderAdminTasks();
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons[0]).toBeInTheDocument();
      fireEvent.click(deleteButtons[0]);
      expect(deleteButtons[0]).toBeInTheDocument();
    });

    it('all buttons have minimum touch target size', () => {
      renderAdminTasks();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.classList.toString()).toMatch(/min-h/);
      });
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode styles to title', () => {
      renderAdminTasks();
      const title = screen.getByRole('heading', { name: /care tasks/i });
      expect(title.className).toMatch(/dark:/);
    });

    it('applies dark mode to cards', () => {
      renderAdminTasks();
      const statsCards = screen.getAllByText(/Total Tasks|Completed|Pending/);
      statsCards.forEach(card => {
        const parent = card.closest('div');
        expect(parent?.className).toMatch(/dark:/);
      });
    });
  });

  describe('Responsive Design', () => {
    it('header uses responsive flex layout', () => {
      renderAdminTasks();
      const section = screen.getByRole('region').parentElement;
      expect(section?.className).toMatch(/flex|md:/);
    });

    it('stats grid is responsive', () => {
      renderAdminTasks();
      const statsSection = screen.getByRole('region', { name: /statistics/i });
      expect(statsSection).toBeInTheDocument();
    });
  });

  describe('Priority Coloring', () => {
    it('high priority tasks have red badge', () => {
      renderAdminTasks();
      const highPriorityBadges = screen.getAllByText('High');
      expect(highPriorityBadges.length).toBeGreaterThan(0);
      highPriorityBadges.forEach(badge => {
        expect(badge.className).toMatch(/red/);
      });
    });

    it('medium priority tasks have yellow badge', () => {
      renderAdminTasks();
      const mediumPriorityBadges = screen.getAllByText('Medium');
      expect(mediumPriorityBadges.length).toBeGreaterThan(0);
      mediumPriorityBadges.forEach(badge => {
        expect(badge.className).toMatch(/yellow/);
      });
    });
  });
});
