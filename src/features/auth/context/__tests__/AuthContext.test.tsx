// React import not needed for this test file
import { render } from '@testing-library/react';
import { AuthProvider, useAuth, type AuthUser } from '../AuthContext';

// Mock the logger
jest.mock('@shared/utils/logger', () => ({
  logger: {
    withContext: jest.fn(() => ({
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('AuthProvider', () => {
    it('should render without crashing', () => {
      const TestComponent = () => <div>Test Child</div>;
      
      const { container } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(container.textContent).toContain('Test Child');
    });

    it('should initialize with null user when localStorage is empty', () => {
      let capturedAuth: any = null;
      
      const TestComponent = () => {
        capturedAuth = useAuth();
        return <div>Test</div>;
      };
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(capturedAuth).toBeTruthy();
      expect(capturedAuth.user).toBeNull();
      expect(capturedAuth.isAuthenticated).toBe(false);
    });

    it('should initialize with user from localStorage', () => {
      const mockUser: AuthUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      let capturedAuth: any = null;
      
      const TestComponent = () => {
        capturedAuth = useAuth();
        return <div>Test</div>;
      };
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(capturedAuth).toBeTruthy();
      expect(capturedAuth.user).toEqual(mockUser);
      expect(capturedAuth.isAuthenticated).toBe(true);
    });

    it('should handle malformed localStorage data', () => {
      localStorage.setItem('user', 'invalid json');
      
      let capturedAuth: any = null;
      
      const TestComponent = () => {
        capturedAuth = useAuth();
        return <div>Test</div>;
      };
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(capturedAuth).toBeTruthy();
      expect(capturedAuth.user).toBeNull();
      expect(capturedAuth.isAuthenticated).toBe(false);
    });

    it('should provide login function that updates state and localStorage', () => {
      let capturedAuth: any = null;
      
      const TestComponent = () => {
        capturedAuth = useAuth();
        return <div>Test</div>;
      };
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(capturedAuth.user).toBeNull();
      
      const newUser: AuthUser = {
        id: 2,
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      
      // Call login and then re-render to get updated state
      capturedAuth.login(newUser);
      
      // Re-render to get updated state
      const TestComponent2 = () => {
        capturedAuth = useAuth();
        return <div>Test</div>;
      };
      
      render(
        <AuthProvider>
          <TestComponent2 />
        </AuthProvider>
      );
      
      expect(capturedAuth.user).toEqual(newUser);
      expect(capturedAuth.isAuthenticated).toBe(true);
      expect(localStorage.getItem('user')).toBeTruthy();
    });

    it('should provide logout function that clears state and localStorage', () => {
      const mockUser: AuthUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      let capturedAuth: any = null;
      
      const TestComponent = () => {
        capturedAuth = useAuth();
        return <div>Test</div>;
      };
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(capturedAuth.user).toEqual(mockUser);
      expect(capturedAuth.isAuthenticated).toBe(true);
      
      // Call logout and then re-render to get updated state
      capturedAuth.logout();
      
      // Re-render to get updated state
      const TestComponent2 = () => {
        capturedAuth = useAuth();
        return <div>Test</div>;
      };
      
      render(
        <AuthProvider>
          <TestComponent2 />
        </AuthProvider>
      );
      
      expect(capturedAuth.user).toBeNull();
      expect(capturedAuth.isAuthenticated).toBe(false);
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const TestComponent = () => {
        try {
          useAuth();
          return <div>No error</div>;
        } catch (error) {
          return <div>Error: {(error as Error).message}</div>;
        }
      };
      
      const { container } = render(<TestComponent />);
      expect(container.textContent).toContain('Error: useAuth must be used within AuthProvider');
    });
  });
});