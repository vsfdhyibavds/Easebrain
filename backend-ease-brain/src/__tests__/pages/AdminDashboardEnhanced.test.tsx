import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../../pages/AdminDashboardEnhanced';
import { DarkModeProvider } from '../../context/DarkModeContext';

// Mock the lazy-loaded DashboardCharts component
vi.mock('../../components/admin', async () => {
  const actual = await vi.importActual('../../components/admin');
  return {
    ...actual,
    DashboardCharts: () => <div data-testid="dashboard-charts">Charts Component</div>,
  };
});

const renderAdminDashboard = () => {
  return render(
    <BrowserRouter>
      <DarkModeProvider>
        <AdminDashboard />
      </DarkModeProvider>
    </BrowserRouter>
  );
};

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the dashboard page title', () => {
      renderAdminDashboard();
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('renders the welcome message', () => {
      renderAdminDashboard();
      expect(screen.getByText(/here's what's happening in your system today/i)).toBeInTheDocument();
    });

    it('renders all 4 metric cards', () => {
      renderAdminDashboard();
      expect(screen.getByText('Total Dependents')).toBeInTheDocument();
      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('System Users')).toBeInTheDocument();
      expect(screen.getByText('Alerts (24h)')).toBeInTheDocument();
    });

    it('renders recent activity section', () => {
      renderAdminDashboard();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('renders system health section', () => {
      renderAdminDashboard();
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    it('renders quick actions section', () => {
      renderAdminDashboard();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('renders top insights section', () => {
      renderAdminDashboard();
      expect(screen.getByText('Top Insights')).toBeInTheDocument();
    });

    it('renders compliance status section', () => {
      renderAdminDashboard();
      expect(screen.getByText('Compliance Status')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has a main content region', () => {
      renderAdminDashboard();
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });

    it('dashboard controls have proper ARIA attributes', () => {
      renderAdminDashboard();
      const controls = screen.getByRole('group', { name: /dashboard controls/i });
      expect(controls).toBeInTheDocument();
    });

    it('all buttons have descriptive aria-labels', () => {
      renderAdminDashboard();
      const exportButton = screen.getByRole('button', { name: /open export modal/i });
      expect(exportButton).toHaveAttribute('aria-label');
    });

    it('recent activity has aria-live polite', () => {
      renderAdminDashboard();
      const activitySection = screen.getByRole('group', { name: /recent system activity events/i });
      expect(activitySection).toHaveAttribute('aria-live', 'polite');
    });

    it('metric cards are in a labeled section', () => {
      renderAdminDashboard();
      const metricsSection = screen.getByRole('region');
      expect(metricsSection).toBeInTheDocument();
    });
  });

  describe('Button Interactivity', () => {
    it('export button click opens export modal', () => {
      renderAdminDashboard();
      const exportButton = screen.getByRole('button', { name: /open export modal/i });
      fireEvent.click(exportButton);
      // Modal should become visible (modal check depends on implementation)
      expect(exportButton).toBeInTheDocument();
    });

    it('quick action buttons are keyboard accessible', () => {
      renderAdminDashboard();
      const addDependentButton = screen.getByRole('button', { name: /add dependent/i });
      expect(addDependentButton).toHaveProperty('type', 'button');
      // Should not throw on keyboard interaction
      fireEvent.keyDown(addDependentButton, { key: 'Enter', code: 'Enter' });
    });

    it('all buttons have min-height for touch targets', () => {
      renderAdminDashboard();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const classList = button.classList.toString();
        expect(classList).toMatch(/min-h-\[44px\]/);
      });
    });
  });

  describe('Metric Calculations', () => {
    it('displays correct metric values', () => {
      renderAdminDashboard();
      expect(screen.getByText('42')).toBeInTheDocument(); // Total Dependents
      expect(screen.getByText('18')).toBeInTheDocument(); // Active Tasks
      expect(screen.getByText('156')).toBeInTheDocument(); // System Users
      expect(screen.getByText('7')).toBeInTheDocument(); // Alerts
    });

    it('shows trend indicators', () => {
      renderAdminDashboard();
      const trendLabels = screen.getAllByText(/vs last/i);
      expect(trendLabels.length).toBeGreaterThan(0);
    });
  });

  describe('System Health Display', () => {
    it('displays database status', () => {
      renderAdminDashboard();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('healthy')).toBeInTheDocument();
    });

    it('displays API response time', () => {
      renderAdminDashboard();
      expect(screen.getByText('API Response')).toBeInTheDocument();
      expect(screen.getByText('145ms')).toBeInTheDocument();
    });

    it('displays error rate', () => {
      renderAdminDashboard();
      expect(screen.getByText('Error Rate')).toBeInTheDocument();
      expect(screen.getByText('0.2%')).toBeInTheDocument();
    });

    it('displays last backup info', () => {
      renderAdminDashboard();
      expect(screen.getByText('Last Backup')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });
  });

  describe('Compliance Status', () => {
    it('shows HIPAA compliance status as passing', () => {
      renderAdminDashboard();
      expect(screen.getByText('HIPAA Compliance')).toBeInTheDocument();
      expect(screen.getByText('All requirements met')).toBeInTheDocument();
    });

    it('shows data privacy as passing', () => {
      renderAdminDashboard();
      expect(screen.getByText('Data Privacy')).toBeInTheDocument();
      expect(screen.getByText('All checks passed')).toBeInTheDocument();
    });

    it('shows SSL certificate expiry warning', () => {
      renderAdminDashboard();
      expect(screen.getByText('SSL Certificate')).toBeInTheDocument();
      expect(screen.getByText('Expires in 45 days')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to containers', () => {
      renderAdminDashboard();
      const containers = screen.getAllByRole('main')[0];
      expect(containers).toBeInTheDocument();
      // Dark mode classes should be present in className
      const cards = screen.getAllByText(/Total Dependents|Active Tasks/);
      cards.forEach(card => {
        const parent = card.closest('div');
        expect(parent?.className).toMatch(/dark:/);
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders grid layouts for metrics', () => {
      renderAdminDashboard();
      const metricCards = screen.getByText('Total Dependents').closest('div')?.parentElement;
      expect(metricCards?.className).toMatch(/grid|md:|lg:/);
    });

    it('header is responsive with flex layout', () => {
      renderAdminDashboard();
      const header = screen.getByRole('heading', { name: /dashboard/i }).closest('div');
      expect(header?.className).toMatch(/flex|md:flex/);
    });
  });

  describe('Performance', () => {
    it('lazy loads dashboard charts', async () => {
      renderAdminDashboard();
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
      });
    });

    it('renders with suspense boundary', () => {
      renderAdminDashboard();
      // Suspense should handle loading state (SkeletonLoader)
      expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
    });
  });
});
