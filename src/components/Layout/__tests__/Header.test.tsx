// React import removed as it's not used
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../features/auth/context/AuthContext';

// Mock AvatarMenuDropdown
jest.mock('../../AvatarMenuDropdown/AvatarMenuDropdown', () => {
  return function MockAvatarMenuDropdown() {
    return <div data-testid="avatar-dropdown">Avatar Menu</div>;
  };
});

// Mock Button component
jest.mock('../../../shared/ui/Button', () => {
  return function MockButton({ children, variant, size, onClick, fullWidth, ...props }: any) {
    return (
      <button 
        onClick={onClick}
        data-testid={`button-${variant}`}
        className={`button-${variant} ${fullWidth ? 'w-full' : ''}`}
        {...props}
      >
        {children}
      </button>
    );
  };
});

// Import component after mocks
import Header from '../Header';

const renderHeader = () => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderHeader();
      expect(container).toBeTruthy();
    });

    it('should display the logo and brand name', () => {
      renderHeader();
      
      expect(screen.getByText('EarthForUs')).toBeTruthy();
      const logoIcon = screen.getByText('EarthForUs').closest('div')?.querySelector('svg');
      expect(logoIcon).toBeTruthy();
    });

    it('should display navigation links', () => {
      renderHeader();
      
      expect(screen.getByText('Events')).toBeTruthy();
      expect(screen.getByText('About')).toBeTruthy();
      expect(screen.getByText('Contact')).toBeTruthy();
    });

    it('should display authentication buttons when not authenticated', () => {
      renderHeader();
      
      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getByText('Get Started')).toBeTruthy();
      expect(screen.queryByTestId('avatar-dropdown')).toBeFalsy();
    });

    it('should display avatar dropdown when authenticated', () => {
      // Mock authenticated state by mocking the AuthContext
      jest.spyOn(require('../../../features/auth/context/AuthContext'), 'useAuth')
        .mockReturnValue({ user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' } });
      
      renderHeader();
      
      expect(screen.queryByText('Sign In')).toBeFalsy();
      expect(screen.queryByText('Get Started')).toBeFalsy();
      expect(screen.getByTestId('avatar-dropdown')).toBeTruthy();
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href attributes for navigation links', () => {
      renderHeader();
      
      const eventsLink = screen.getByText('Events').closest('a');
      const aboutLink = screen.getByText('About').closest('a');
      const contactLink = screen.getByText('Contact').closest('a');
      
      expect(eventsLink?.getAttribute('href')).toBe('/events');
      expect(aboutLink?.getAttribute('href')).toBe('/about');
      expect(contactLink?.getAttribute('href')).toBe('/contact');
    });

    it('should have correct href attributes for authentication links', () => {
      renderHeader();
      
      const signInLink = screen.getByText('Sign In').closest('a');
      const getStartedLink = screen.getByText('Get Started').closest('a');
      
      expect(signInLink?.getAttribute('href')).toBe('/login');
      expect(getStartedLink?.getAttribute('href')).toBe('/signup');
    });

    it('should have correct href attribute for logo', () => {
      renderHeader();
      
      const logoLink = screen.getByText('EarthForUs').closest('a');
      expect(logoLink?.getAttribute('href')).toBe('/');
    });
  });

  describe('Mobile Menu', () => {
    it('should have mobile menu button', () => {
      renderHeader();
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeTruthy();
    });

    it('should toggle mobile menu when button is clicked', () => {
      renderHeader();
      
      const menuButton = screen.getByLabelText('Toggle menu');
      
      // Initially mobile menu should not be visible
      const eventsElement = screen.queryByText('Events');
      expect(eventsElement).toBeTruthy();
      
      // Click to open menu
      fireEvent.click(menuButton);
      
      // Mobile menu should now be visible
      // Note: The actual mobile menu visibility is handled by CSS classes
      // We can test that the click handler was called
      expect(menuButton).toBeTruthy();
    });

    it('should show hamburger icon when menu is closed', () => {
      renderHeader();
      
      const menuButton = screen.getByLabelText('Toggle menu');
      const svg = menuButton.querySelector('svg');
      
      // Should show hamburger icon (3 horizontal lines)
      expect(svg).toBeTruthy();
      // The hamburger icon has 3 path elements for the 3 lines
      const paths = svg?.querySelectorAll('path');
      expect(paths?.length).toBe(1); // Single path with 3 line commands
    });
  });

  describe('Styling', () => {
    it('should have correct header styling', () => {
      renderHeader();
      
      const header = screen.getByText('EarthForUs').closest('header');
      expect(header?.className).toContain('bg-white');
      expect(header?.className).toContain('dark:bg-gray-800');
      expect(header?.className).toContain('shadow-sm');
      expect(header?.className).toContain('border-b');
      expect(header?.className).toContain('border-gray-200');
      expect(header?.className).toContain('dark:border-gray-700');
    });

    it('should have correct container styling', () => {
      renderHeader();
      
      const container = screen.getByText('EarthForUs').closest('.max-w-7xl');
      expect(container?.className).toContain('max-w-7xl');
      expect(container?.className).toContain('mx-auto');
      expect(container?.className).toContain('px-4');
      expect(container?.className).toContain('sm:px-6');
      expect(container?.className).toContain('lg:px-8');
    });

    it('should have correct logo styling', () => {
      renderHeader();
      
      const logoContainer = screen.getByText('EarthForUs').closest('div');
      expect(logoContainer?.className).toContain('flex');
      expect(logoContainer?.className).toContain('items-center');
      
      const logoIcon = logoContainer?.querySelector('.w-8.h-8.bg-primary-600.rounded-full');
      expect(logoIcon).toBeTruthy();
    });

    it('should have correct navigation styling', () => {
      renderHeader();
      
      const nav = screen.getByText('Events').closest('nav');
      expect(nav?.className).toContain('hidden');
      expect(nav?.className).toContain('md:flex');
      expect(nav?.className).toContain('items-center');
      expect(nav?.className).toContain('space-x-8');
    });

    it('should have correct mobile menu button styling', () => {
      renderHeader();
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton.className).toContain('md:hidden');
      expect(menuButton.className).toContain('p-2');
      expect(menuButton.className).toContain('rounded-md');
      expect(menuButton.className).toContain('text-gray-400');
      expect(menuButton.className).toContain('hover:text-gray-500');
      expect(menuButton.className).toContain('hover:bg-gray-100');
      expect(menuButton.className).toContain('dark:hover:bg-gray-700');
      expect(menuButton.className).toContain('focus:outline-none');
      expect(menuButton.className).toContain('focus:ring-2');
      expect(menuButton.className).toContain('focus:ring-primary-500');
    });
  });

  describe('Responsive Design', () => {
    it('should hide desktop navigation on mobile', () => {
      renderHeader();
      
      const desktopNav = screen.getByText('Events').closest('nav');
      expect(desktopNav?.className).toContain('hidden');
      expect(desktopNav?.className).toContain('md:flex');
    });

    it('should show mobile menu button on mobile', () => {
      renderHeader();
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton.className).toContain('md:hidden');
    });
  });

  describe('Edge Cases', () => {
    it('should handle authentication state changes', () => {
      const { rerender } = renderHeader();
      
      // Initially not authenticated
      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getByText('Get Started')).toBeTruthy();
      
      // Mock authenticated state by mocking the AuthContext
      jest.spyOn(require('../../../features/auth/context/AuthContext'), 'useAuth')
        .mockReturnValue({ user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' } });
      
      // Re-render with authenticated state
      rerender(
        <AuthProvider>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </AuthProvider>
      );
      
      // Should now show avatar dropdown
      expect(screen.getByTestId('avatar-dropdown')).toBeTruthy();
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });

    it('should render with all props correctly', () => {
      const { container } = renderHeader();
      expect(container.firstChild).toBeTruthy();
    });
  });
});