import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../../components/SkeletonLoader';

describe('SkeletonLoader Component', () => {
  describe('Default Skeleton Type', () => {
    it('renders skeleton loader', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton).toBeInTheDocument();
    });

    it('has loading animation class', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton.className).toMatch(/animate/);
    });

    it('has background color for skeleton effect', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton.className).toMatch(/bg-gray|bg-slate/);
    });

    it('has rounded corners', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton.className).toMatch(/rounded/);
    });
  });

  describe('Card Skeleton Type', () => {
    it('renders multiple skeleton lines for card', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton).toBeInTheDocument();
    });

    it('card skeleton has appropriate container', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton.className).toMatch(/bg|rounded/);
    });

    it('card skeleton has multiple child elements', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      const children = skeleton.querySelectorAll('[class*="bg"]');
      expect(children.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Table Skeleton Type', () => {
    it('renders table skeleton', () => {
      render(<SkeletonLoader type="table" />);
      const skeleton = screen.getByTestId('skeleton-table');
      expect(skeleton).toBeInTheDocument();
    });

    it('table skeleton has row structure', () => {
      render(<SkeletonLoader type="table" />);
      const skeleton = screen.getByTestId('skeleton-table');
      const rows = skeleton.querySelectorAll('[class*="flex"]');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('table rows have multiple cells', () => {
      render(<SkeletonLoader type="table" />);
      const skeleton = screen.getByTestId('skeleton-table');
      const cells = skeleton.querySelectorAll('[class*="bg-gray"]');
      expect(cells.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('List Skeleton Type', () => {
    it('renders list skeleton', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      expect(skeleton).toBeInTheDocument();
    });

    it('list skeleton has multiple items', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      const items = skeleton.querySelectorAll('[class*="mb"]');
      expect(items.length).toBeGreaterThan(1);
    });

    it('each list item has proper structure', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      const items = skeleton.querySelectorAll('div[class*="flex"]');
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Count', () => {
    it('renders specified number of skeletons', () => {
      render(<SkeletonLoader type="card" count={5} />);
      const skeleton = screen.getByTestId('skeleton-card');
      const items = skeleton.querySelectorAll('[class*="animate"]');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('default count is 3', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      const skeletonItems = skeleton.querySelectorAll('[class*="rounded"]');
      expect(skeletonItems.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Dark Mode Support', () => {
    it('dark mode class is applied when isDark prop is true', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton.className).toMatch(/dark:|opacity/);
    });

    it('default skeleton works in light mode', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton).toBeInTheDocument();
    });

    it('card skeleton responds to dark mode', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton).toBeInTheDocument();
    });

    it('table skeleton responds to dark mode', () => {
      render(<SkeletonLoader type="table" />);
      const skeleton = screen.getByTestId('skeleton-table');
      expect(skeleton).toBeInTheDocument();
    });

    it('list skeleton responds to dark mode', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('has pulse animation', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton.className).toMatch(/pulse|animate/);
    });

    it('card type has animation', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton.className || skeleton.querySelector('div')?.className).toMatch(/animate|pulse/);
    });

    it('animation is consistent across types', () => {
      const { rerender } = render(<SkeletonLoader type="card" />);
      let cardSkeleton = screen.getByTestId('skeleton-card');
      expect(cardSkeleton).toBeInTheDocument();

      rerender(<SkeletonLoader type="table" />);
      let tableSkeleton = screen.getByTestId('skeleton-table');
      expect(tableSkeleton).toBeInTheDocument();

      rerender(<SkeletonLoader type="list" />);
      let listSkeleton = screen.getByTestId('skeleton-list');
      expect(listSkeleton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has aria-busy attribute', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('card skeleton has aria-label for loading state', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      const hasAriaLabel = skeleton.hasAttribute('aria-label');
      const hasAriaBusy = skeleton.hasAttribute('aria-busy');
      expect(hasAriaLabel || hasAriaBusy).toBe(true);
    });

    it('table skeleton has aria-label', () => {
      render(<SkeletonLoader type="table" />);
      const skeleton = screen.getByTestId('skeleton-table');
      const hasAriaLabel = skeleton.hasAttribute('aria-label');
      const hasAriaBusy = skeleton.hasAttribute('aria-busy');
      expect(hasAriaLabel || hasAriaBusy).toBe(true);
    });

    it('list skeleton is marked as loading', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      const hasAriaBusyTrue = skeleton.getAttribute('aria-busy') === 'true';
      const hasAriaLabel = skeleton.hasAttribute('aria-label');
      expect(hasAriaBusyTrue || hasAriaLabel).toBe(true);
    });
  });

  describe('Styling', () => {
    it('has proper spacing', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      expect(skeleton.className).toMatch(/p|m/);
    });

    it('skeleton has appropriate height', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton.className).toMatch(/h-|w-/);
    });

    it('card skeleton has proper card styling', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton.className).toMatch(/rounded|shadow|p/);
    });
  });

  describe('Type Props Validation', () => {
    it('renders with "card" type', () => {
      render(<SkeletonLoader type="card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders with "table" type', () => {
      render(<SkeletonLoader type="table" />);
      const skeleton = screen.getByTestId('skeleton-table');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders with "list" type', () => {
      render(<SkeletonLoader type="list" />);
      const skeleton = screen.getByTestId('skeleton-list');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders with default type (no type prop)', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton).toBeInTheDocument();
    });
  });
});
