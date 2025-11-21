import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

// Mock dependencies
jest.mock('../../shared/components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

jest.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false
  })
}));

jest.mock('../../components/AvatarMenuDropdown/AvatarMenuDropdown', () => {
  return function MockAvatarMenuDropdown() {
    return <div data-testid="avatar-dropdown">Avatar Menu</div>;
  };
});

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLayout = (props: any = {}) => {
    return render(
      <Layout {...props}>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );
  };

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      renderLayout();
      
      expect(screen.getByTestId('error-boundary')).toBeTruthy();
      expect(screen.getByTestId('test-content')).toBeTruthy();
      expect(screen.getByText('EarthForUs')).toBeTruthy();
    });

    it('should render children content', () => {
      renderLayout();
      
      expect(screen.getByTestId('test-content')).toBeTruthy();
      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('should render with custom className', () => {
      const { container } = renderLayout({ className: 'custom-class' });
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Header Functionality', () => {
    it('should show header by default', () => {
      renderLayout();
      
      expect(screen.getByText('EarthForUs')).toBeTruthy();
      expect(screen.getByText('Events')).toBeTruthy();
      expect(screen.getByText('About')).toBeTruthy();
      expect(screen.getByText('Contact')).toBeTruthy();
    });

    it('should hide header when showHeader is false', () => {
      renderLayout({ showHeader: false });
      
      expect(screen.queryByText('EarthForUs')).toBeFalsy();
      expect(screen.queryByText('Events')).toBeFalsy();
      expect(screen.queryByText('About')).toBeFalsy();
      expect(screen.queryByText('Contact')).toBeFalsy();
    });

    it('should show sign in and get started buttons when not authenticated', () => {
      renderLayout();
      
      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getByText('Get Started')).toBeTruthy();
      expect(screen.queryByTestId('avatar-dropdown')).toBeFalsy();
    });

    it('should show avatar dropdown when authenticated', () => {
      jest.resetModules();
      jest.mock('../../features/auth/context/AuthContext', () => ({
        useAuth: () => ({
          isAuthenticated: true
        })
      }));
      
      const { useAuth } = require('../../features/auth/context/AuthContext');
      useAuth.mockReturnValue({ isAuthenticated: true });
      
      renderLayout();
      
      expect(screen.queryByText('Sign In')).toBeFalsy();
      expect(screen.queryByText('Get Started')).toBeFalsy();
      expect(screen.getByTestId('avatar-dropdown')).toBeTruthy();
    });

    it('should have correct navigation links', () => {
      renderLayout();
      
      const eventsLink = screen.getByText('Events').closest('a');
      const aboutLink = screen.getByText('About').closest('a');
      const contactLink = screen.getByText('Contact').closest('a');
      
      expect(eventsLink).toHaveAttribute('href', '/events');
      expect(aboutLink).toHaveAttribute('href', '/about');
      expect(contactLink).toHaveAttribute('href', '/contact');
    });

    it('should have correct authentication links', () => {
      renderLayout();
      
      const signInLink = screen.getByText('Sign In').closest('a');
      const getStartedLink = screen.getByText('Get Started').closest('a');
      
      expect(signInLink).toHaveAttribute('href', '/login');
      expect(getStartedLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Footer Functionality', () => {
    it('should show footer by default', () => {
      renderLayout();
      
      expect(screen.getByText('Connecting passionate volunteers with meaningful environmental initiatives.')).toBeTruthy();
      expect(screen.getByText(/© \d{4} EarthForUs\. All rights reserved\./)).toBeTruthy();
    });

    it('should hide footer when showFooter is false', () => {
      renderLayout({ showFooter: false });
      
      expect(screen.queryByText('Connecting passionate volunteers with meaningful environmental initiatives.')).toBeFalsy();
      expect(screen.queryByText(/© \d{4} EarthForUs\. All rights reserved\./)).toBeFalsy();
    });
  });

  describe('Main Content', () => {
    it('should render children in main element', () => {
      renderLayout();
      
      const main = screen.getByRole('main');
      expect(main).toBeTruthy();
      expect(main).toContainElement(screen.getByTestId('test-content'));
    });

    it('should have flex layout structure', () => {
      const { container } = renderLayout();
      
      const layoutContainer = container.querySelector('.min-h-screen.flex.flex-col');
      expect(layoutContainer).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should have correct header styling', () => {
      renderLayout();
      
      const header = screen.getByText('EarthForUs').closest('header');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
      expect(header).toHaveClass('bg-white/90', 'dark:bg-gray-900/90');
      expect(header).toHaveClass('backdrop-blur', 'shadow-sm');
      expect(header).toHaveClass('border-b', 'border-gray-200', 'dark:border-gray-800');
      expect(header).toHaveClass('transition-colors', 'duration-200');
    });

    it('should have correct footer styling', () => {
      renderLayout();
      
      const footer = screen.getByText('Connecting passionate volunteers with meaningful environmental initiatives.').closest('footer');
      expect(footer).toHaveClass('bg-white', 'dark:bg-gray-900');
      expect(footer).toHaveClass('border-t', 'border-gray-200', 'dark:border-gray-800');
      expect(footer).toHaveClass('transition-colors', 'duration-200');
    });

    it('should have correct main styling', () => {
      renderLayout();
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
    });

    it('should have correct layout container styling', () => {
      const { container } = renderLayout();
      
      const layoutContainer = container.querySelector('.min-h-screen.flex.flex-col');
      expect(layoutContainer).toHaveClass('min-h-screen', 'flex', 'flex-col');
      expect(layoutContainer).toHaveClass('bg-brand-50', 'dark:bg-gray-950');
      expect(layoutContainer).toHaveClass('transition-colors', 'duration-200');
      expect(layoutContainer).toHaveClass('theme-bg', 'theme-text');
    });

    it('should have correct logo styling', () => {
      renderLayout();
      
      const logoContainer = screen.getByText('EarthForUs').closest('div');
      expect(logoContainer).toHaveClass('flex', 'items-center');
      
      const logoIcon = logoContainer?.querySelector('.w-8.h-8.bg-brand-600.rounded-full');
      expect(logoIcon).toBeTruthy();
    });

    it('should have correct navigation styling', () => {
      renderLayout();
      
      const nav = screen.getByText('Events').closest('nav');
      expect(nav).toHaveClass('hidden', 'md:flex');
      expect(nav).toHaveClass('items-center', 'space-x-8');
    });

    it('should have correct navigation link styling', () => {
      renderLayout();
      
      const eventsLink = screen.getByText('Events').closest('a');
      expect(eventsLink).toHaveClass('text-gray-700', 'dark:text-gray-300');
      expect(eventsLink).toHaveClass('hover:text-brand-600', 'dark:hover:text-brand-400');
      expect(eventsLink).toHaveClass('font-medium', 'transition-colors');
    });

    it('should have correct authentication button styling', () => {
      renderLayout();
      
      const signInButton = screen.getByText('Sign In').closest('a');
      const getStartedButton = screen.getByText('Get Started').closest('a');
      
      expect(signInButton).toHaveClass('inline-flex', 'items-center', 'justify-center');
      expect(signInButton).toHaveClass('px-3', 'py-1.5', 'text-sm', 'font-medium');
      expect(signInButton).toHaveClass('text-gray-700', 'dark:text-gray-200');
      expect(signInButton).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800');
      expect(signInButton).toHaveClass('rounded-lg', 'transition-colors');
      
      expect(getStartedButton).toHaveClass('inline-flex', 'items-center', 'justify-center');
      expect(getStartedButton).toHaveClass('px-3', 'py-1.5', 'text-sm', 'font-medium');
      expect(getStartedButton).toHaveClass('bg-brand-600', 'hover:bg-brand-700');
      expect(getStartedButton).toHaveClass('text-white', 'rounded-lg', 'transition-colors');
    });
  });

  describe('Responsive Design', () => {
    it('should hide navigation on small screens', () => {
      renderLayout();
      
      const nav = screen.getByText('Events').closest('nav');
      expect(nav).toHaveClass('hidden', 'md:flex');
    });

    it('should have responsive container widths', () => {
      renderLayout();
      
      const container = screen.getByText('EarthForUs').closest('.max-w-7xl');
      expect(container).toHaveClass('max-w-7xl', 'mx-auto');
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Layout />);
      
      expect(container).toBeTruthy();
      expect(screen.getByText('EarthForUs')).toBeTruthy();
    });

    it('should handle multiple children', () => {
      render(
        <Layout>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Layout>
      );
      
      expect(screen.getByText('Child 1')).toBeTruthy();
      expect(screen.getByText('Child 2')).toBeTruthy();
      expect(screen.getByText('Child 3')).toBeTruthy();
    });

    it('should handle custom className with existing classes', () => {
      const { container } = renderLayout({ className: 'custom-layout extra-class' });
      
      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('custom-layout');
      expect(layoutContainer).toHaveClass('extra-class');
      expect(layoutContainer).toHaveClass('min-h-screen', 'flex', 'flex-col');
    });

    it('should handle undefined children gracefully', () => {
      render(<Layout>{undefined}</Layout>);
      
      expect(screen.getByText('EarthForUs')).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('should support dark mode classes', () => {
      renderLayout();
      
      const header = screen.getByText('EarthForUs').closest('header');
      expect(header).toHaveClass('dark:bg-gray-900/90');
      expect(header).toHaveClass('dark:border-gray-800');
      
      const footer = screen.getByText('Connecting passionate volunteers with meaningful environmental initiatives.').closest('footer');
      expect(footer).toHaveClass('dark:bg-gray-900');
      expect(footer).toHaveClass('dark:border-gray-800');
    });

    it('should have theme transition classes', () => {
      renderLayout();
      
      const layoutContainer = screen.getByText('EarthForUs').closest('.min-h-screen.flex.flex-col');
      expect(layoutContainer).toHaveClass('theme-bg', 'theme-text');
      expect(layoutContainer).toHaveClass('transition-colors', 'duration-200');
    });
  });
});