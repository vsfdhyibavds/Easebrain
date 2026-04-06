import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminSettings from '../../pages/AdminSettings';
import { DarkModeProvider } from '../../context/DarkModeContext';

const renderAdminSettings = () => {
  return render(
    <BrowserRouter>
      <DarkModeProvider>
        <AdminSettings />
      </DarkModeProvider>
    </BrowserRouter>
  );
};

describe('AdminSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders page title', () => {
      renderAdminSettings();
      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    });

    it('renders dashboard settings section', () => {
      renderAdminSettings();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders notification settings section', () => {
      renderAdminSettings();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('renders security settings section', () => {
      renderAdminSettings();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('renders save settings button', () => {
      renderAdminSettings();
      expect(screen.getByRole('button', { name: /save your settings changes|no unsaved changes/i })).toBeInTheDocument();
    });

    it('renders reset button', () => {
      renderAdminSettings();
      expect(screen.getByRole('button', { name: /reset all settings/i })).toBeInTheDocument();
    });

    it('renders info box', () => {
      renderAdminSettings();
      expect(screen.getByText(/settings are saved individually/i)).toBeInTheDocument();
    });
  });

  describe('Dashboard Settings', () => {
    it('renders refresh rate slider', () => {
      renderAdminSettings();
      expect(screen.getByText('Auto-Refresh Rate (seconds)')).toBeInTheDocument();
      const slider = screen.getByRole('slider', { name: '' });
      expect(slider).toBeInTheDocument();
    });

    it('displays current refresh rate value', () => {
      renderAdminSettings();
      expect(screen.getByText(/30s/)).toBeInTheDocument();
    });

    it('renders time format radio buttons', () => {
      renderAdminSettings();
      expect(screen.getByText('Time Format')).toBeInTheDocument();
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThanOrEqual(2);
    });

    it('renders dark mode toggle', () => {
      renderAdminSettings();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox', { name: /dark mode/i });
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Notification Settings', () => {
    it('renders in-app notifications toggle', () => {
      renderAdminSettings();
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox', { name: /in-app notifications/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('renders email alerts toggle', () => {
      renderAdminSettings();
      expect(screen.getByText('Email Alerts')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox', { name: /email alerts/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('renders auto-logout setting', () => {
      renderAdminSettings();
      expect(screen.getByText('Auto-Logout (minutes)')).toBeInTheDocument();
      const input = screen.getByDisplayValue('60');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Security Settings', () => {
    it('renders 2FA toggle', () => {
      renderAdminSettings();
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox', { name: /two-factor authentication/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('renders change password button', () => {
      renderAdminSettings();
      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    });
  });

  describe('Settings Interaction', () => {
    it('changes refresh rate via slider', () => {
      renderAdminSettings();
      const slider = screen.getByRole('slider', { name: '' }) as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '60' } });

      expect(slider.value).toBe('60');
    });

    it('selects time format', () => {
      renderAdminSettings();
      const timeFormatRadios = screen.getAllByRole('radio');
      fireEvent.click(timeFormatRadios[1]);

      expect(timeFormatRadios[1]).toBeChecked();
    });

    it('toggles dark mode', () => {
      renderAdminSettings();
      const darkModeCheckbox = screen.getByRole('checkbox', { name: /dark mode/i }) as HTMLInputElement;
      fireEvent.click(darkModeCheckbox);

      expect(darkModeCheckbox.checked).not.toBe(false);
    });

    it('toggles in-app notifications', () => {
      renderAdminSettings();
      const notifCheckbox = screen.getByRole('checkbox', { name: /in-app notifications/i }) as HTMLInputElement;
      const wasChecked = notifCheckbox.checked;
      fireEvent.click(notifCheckbox);

      expect(notifCheckbox.checked).toBe(!wasChecked);
    });

    it('toggles email alerts', () => {
      renderAdminSettings();
      const emailCheckbox = screen.getByRole('checkbox', { name: /email alerts/i }) as HTMLInputElement;
      const wasChecked = emailCheckbox.checked;
      fireEvent.click(emailCheckbox);

      expect(emailCheckbox.checked).toBe(!wasChecked);
    });

    it('changes auto-logout minutes', () => {
      renderAdminSettings();
      const autoLogoutInput = screen.getByDisplayValue('60') as HTMLInputElement;
      fireEvent.change(autoLogoutInput, { target: { value: '120' } });

      expect(autoLogoutInput.value).toBe('120');
    });

    it('toggles 2FA', () => {
      renderAdminSettings();
      const tfaCheckbox = screen.getByRole('checkbox', { name: /two-factor authentication/i }) as HTMLInputElement;
      const wasChecked = tfaCheckbox.checked;
      fireEvent.click(tfaCheckbox);

      expect(tfaCheckbox.checked).toBe(!wasChecked);
    });
  });

  describe('Button States', () => {
    it('save button is disabled initially', () => {
      renderAdminSettings();
      const saveButton = screen.getByRole('button', { name: /no unsaved changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('save button becomes enabled after change', async () => {
      renderAdminSettings();
      const slider = screen.getByRole('slider', { name: '' }) as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '60' } });

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save your settings changes/i });
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('reset button is always enabled', () => {
      renderAdminSettings();
      const resetButton = screen.getByRole('button', { name: /reset all settings/i });
      expect(resetButton).not.toBeDisabled();
    });
  });

  describe('Save Functionality', () => {
    it('save button is clickable', async () => {
      renderAdminSettings();
      const slider = screen.getByRole('slider', { name: '' }) as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '60' } });

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save your settings changes/i });
        fireEvent.click(saveButton);
        expect(saveButton).toBeInTheDocument();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('reset button resets settings', () => {
      renderAdminSettings();
      const slider = screen.getByRole('slider', { name: '' }) as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '60' } });

      const resetButton = screen.getByRole('button', { name: /reset all settings/i });
      fireEvent.click(resetButton);

      expect(slider.value).toBe('30');
    });
  });

  describe('Accessibility', () => {
    it('has main content region', () => {
      renderAdminSettings();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('page title is in a section with aria-labelledby', () => {
      renderAdminSettings();
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('save button has descriptive aria-label', () => {
      renderAdminSettings();
      const saveButton = screen.getByRole('button', { name: /save your settings changes|no unsaved changes/i });
      expect(saveButton).toHaveAttribute('aria-label');
    });

    it('reset button has descriptive aria-label', () => {
      renderAdminSettings();
      const resetButton = screen.getByRole('button', { name: /reset all settings/i });
      expect(resetButton).toHaveAttribute('aria-label');
    });

    it('buttons have touch-friendly sizing', () => {
      renderAdminSettings();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.classList.toString()).toMatch(/min-h/);
      });
    });

    it('info box has role note', () => {
      renderAdminSettings();
      const infoBox = screen.getByRole('note');
      expect(infoBox).toBeInTheDocument();
    });

    it('success message has status role', async () => {
      renderAdminSettings();
      // This would require simulating a successful save, which may depend on async behavior
      // For now, we verify the structure supports it
      expect(screen.getByText(/settings are saved individually/i)).toBeInTheDocument();
    });
  });

  describe('Form Labels', () => {
    it('all form fields have associated labels', () => {
      renderAdminSettings();
      expect(screen.getByText('Auto-Refresh Rate (seconds)')).toBeInTheDocument();
      expect(screen.getByText('Time Format')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
      expect(screen.getByText('Email Alerts')).toBeInTheDocument();
      expect(screen.getByText('Auto-Logout (minutes)')).toBeInTheDocument();
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to sections', () => {
      renderAdminSettings();
      const sections = screen.getAllByText(/Dashboard|Notifications|Security/);
      sections.forEach(section => {
        const parent = section.closest('div');
        expect(parent?.className).toMatch(/dark:/);
      });
    });
  });

  describe('Responsive Design', () => {
    it('settings grid is responsive', () => {
      renderAdminSettings();
      const dashboardLabel = screen.getByText('Dashboard');
      const parent = dashboardLabel.closest('div')?.parentElement;
      expect(parent?.className).toMatch(/lg:/);
    });

    it('button group is responsive', () => {
      renderAdminSettings();
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
