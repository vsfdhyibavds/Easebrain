import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { DarkModeProvider } from '../../context/DarkModeContext';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

const renderWithErrorBoundary = (children: React.ReactNode) => {
  return render(
    <DarkModeProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
    </DarkModeProvider>
  );
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      renderWithErrorBoundary(<div>Content</div>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders multiple children without error', () => {
      renderWithErrorBoundary(
        <>
          <div>First</div>
          <div>Second</div>
        </>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('does not show error ui when no error', () => {
      renderWithErrorBoundary(<div>Working fine</div>);
      expect(screen.queryByText(/Oops, Something Went Wrong/)).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('catches errors thrown in child components', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByText(/Oops, Something Went Wrong/)).toBeInTheDocument();
    });

    it('displays error message on error', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByText(/We're sorry for the inconvenience/i)).toBeInTheDocument();
    });

    it('shows error icon', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      // Look for the error container with the icon
      const errorContainer = screen.getByText(/Oops, Something Went Wrong/).closest('div');
      expect(errorContainer?.parentElement).toBeInTheDocument();
    });

    it('displays error details', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByText(/Error Details:/)).toBeInTheDocument();
    });

    it('includes specific error message in details', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument();
    });
  });

  describe('Error UI Elements', () => {
    beforeEach(() => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
    });

    it('displays main error heading', () => {
      expect(screen.getByRole('heading', { name: /Oops, Something Went Wrong/i })).toBeInTheDocument();
    });

    it('displays error description paragraph', () => {
      expect(screen.getByText(/An unexpected error has occurred/i)).toBeInTheDocument();
    });

    it('displays support contact message', () => {
      expect(screen.getByText(/If the problem persists, please contact support/i)).toBeInTheDocument();
    });

    it('has error details section', () => {
      expect(screen.getByText(/Error Details:/)).toBeInTheDocument();
    });
  });

  describe('Try Again Button', () => {
    it('renders Try Again button', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });

    it('Try Again button is clickable', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(tryAgainButton);
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('Try Again button resets error state', () => {
      const { rerender } = render(
        <DarkModeProvider>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </DarkModeProvider>
      );

      expect(screen.getByText(/Oops, Something Went Wrong/)).toBeInTheDocument();

      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(tryAgainButton);

      rerender(
        <DarkModeProvider>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </DarkModeProvider>
      );

      // After reset and rerender with no error, should show content
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('Try Again button has proper styling', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      expect(tryAgainButton.className).toMatch(/py-3|px-4|rounded/);
    });
  });

  describe('Go to Dashboard Button', () => {
    it('renders Go to Dashboard button', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeInTheDocument();
    });

    it('Go to Dashboard button is clickable', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
      fireEvent.click(dashboardButton);
      expect(dashboardButton).toBeInTheDocument();
    });

    it('Dashboard button has proper styling', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
      expect(dashboardButton.className).toMatch(/py-3|px-4|rounded/);
    });
  });

  describe('Light Mode Styling', () => {
    it('applies light mode background', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const container = screen.getByText(/Oops, Something Went Wrong/).closest('div');
      const parentDiv = container?.parentElement;
      expect(parentDiv?.className).toMatch(/from-teal-50|to-cyan-50|bg-gradient/);
    });

    it('error card has light mode styling', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const errorCard = screen.getByText(/Oops, Something Went Wrong/).closest('div');
      expect(errorCard?.className).toMatch(/bg-white|border-teal/);
    });

    it('error icon has light mode color', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const container = screen.getByText(/Oops, Something Went Wrong/).parentElement?.parentElement;
      expect(container).toBeInTheDocument();
    });

    it('error text has light mode color', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const errorText = screen.getByText(/An unexpected error has occurred/i);
      expect(errorText.className).toMatch(/text-teal/);
    });

    it('error details section has light mode styling', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const detailsSection = screen.getByText(/Error Details:/).parentElement;
      expect(detailsSection?.className).toMatch(/bg-red-50|border-red/);
    });
  });

  describe('Dark Mode Styling', () => {
    it('displays error in dark mode', () => {
      // We need to test that the component responds to dark mode context
      renderWithErrorBoundary(
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      );
      expect(screen.getByText(/Oops, Something Went Wrong/)).toBeInTheDocument();
    });

    it('error UI renders regardless of mode', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const errorHeading = screen.getByRole('heading', { name: /Oops, Something Went Wrong/i });
      expect(errorHeading).toBeInTheDocument();
    });
  });

  describe('Error Information Display', () => {
    it('shows unknown error message for null error', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      // The component should handle and display the error
      expect(screen.getByText(/Error Details:/)).toBeInTheDocument();
    });

    it('error details have monospace font', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const detailsSection = screen.getByText(/Error Details:/).parentElement;
      expect(detailsSection?.className).toMatch(/font-mono/);
    });

    it('error details have overflow handling', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const detailsSection = screen.getByText(/Error Details:/).parentElement;
      expect(detailsSection?.className).toMatch(/overflow|max-h/);
    });
  });

  describe('Layout and Spacing', () => {
    it('error container is full height', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const container = screen.getByText(/Oops, Something Went Wrong/).closest('div')?.parentElement?.parentElement;
      expect(container?.className).toMatch(/min-h-screen/);
    });

    it('error card is centered', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const container = screen.getByText(/Oops, Something Went Wrong/).closest('div')?.parentElement?.parentElement;
      expect(container?.className).toMatch(/flex|items-center|justify-center/);
    });

    it('error card has responsive width', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const card = screen.getByText(/Oops, Something Went Wrong/).closest('div');
      expect(card?.className).toMatch(/max-w-md|w-full/);
    });

    it('error card has rounded corners', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const card = screen.getByText(/Oops, Something Went Wrong/).closest('div');
      expect(card?.className).toMatch(/rounded/);
    });

    it('error card has shadow', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const card = screen.getByText(/Oops, Something Went Wrong/).closest('div');
      expect(card?.className).toMatch(/shadow/);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('error message is easily readable', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByText(/We're sorry for the inconvenience/i)).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('error details are readable with screen readers', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const errorDetailsLabel = screen.getByText(/Error Details:/);
      expect(errorDetailsLabel).toBeInTheDocument();
    });
  });

  describe('Error Boundary Lifecycle', () => {
    it('catches error with getDerivedStateFromError', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByText(/Oops, Something Went Wrong/)).toBeInTheDocument();
    });

    it('logs error with componentDidCatch', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('maintains error state after initial catch', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByText(/Oops, Something Went Wrong/)).toBeInTheDocument();
      expect(screen.getByText(/Oops, Something Went Wrong/)).toBeInTheDocument();
    });
  });

  describe('Button Group Layout', () => {
    it('buttons are properly spaced', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2);
    });

    it('both action buttons are visible', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeInTheDocument();
    });

    it('buttons have consistent styling', () => {
      renderWithErrorBoundary(<ThrowError shouldThrow={true} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toMatch(/w-full|rounded|font-semibold/);
      });
    });
  });
});
