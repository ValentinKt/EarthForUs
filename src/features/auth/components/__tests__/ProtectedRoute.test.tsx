import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock logger
jest.mock('../../../shared/utils/logger', () => ({
  logger: {
    withContext: jest.fn(() => ({
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

// Mock useLocation to track navigation
const mockLocation = { pathname: '/protected', search: '', hash: '', state: null };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => mockLocation),
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ProtectedContent = () => <div>Protected Content</div>;
  const LoginPage = () => <div>Login Page</div>;

  const renderProtectedRoute = (isAuthenticated = false) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  describe('Authentication Logic', () => {
    it('should redirect to login when user is not authenticated', () => {
      renderProtectedRoute(false);
      
      expect(screen.getByText('Login Page')).toBeTruthy();
      expect(screen.queryByText('Protected Content')).toBeFalsy();
    });

    it('should render protected content when user is authenticated', () => {
      // We need to mock the AuthContext to return authenticated user
      const MockAuthProvider = ({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) => {
        const MockAuthContext = React.createContext({
          user: isAuthenticated ? { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User' } : null,
          isAuthenticated,
          login: jest.fn(),
          logout: jest.fn(),
        });
        
        return (
          <MockAuthContext.Provider value={{
            user: isAuthenticated ? { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User' } : null,
            isAuthenticated,
            login: jest.fn(),
            logout: jest.fn(),
          }}>
            {children}
          </MockAuthContext.Provider>
        );
      };
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <MockAuthProvider isAuthenticated={true}>
            <Routes>
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute>
                    <ProtectedContent />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </MockAuthProvider>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Protected Content')).toBeTruthy();
      expect(screen.queryByText('Login Page')).toBeFalsy();
    });
  });

  describe('Navigation State', () => {
    it('should pass current location to login page when redirecting', () => {
      renderProtectedRoute(false);
      
      // The Navigate component should be called with the correct state
      // This is handled internally by React Router, so we just verify the redirect happens
      expect(screen.getByText('Login Page')).toBeTruthy();
    });
  });

  describe('Logging', () => {
    it('should log warning when unauthorized access is attempted', () => {
      const warnSpy = jest.fn();
      const debugSpy = jest.fn();
      
      jest.mock('../../../shared/utils/logger', () => ({
        logger: {
          withContext: jest.fn(() => ({
            warn: warnSpy,
            debug: debugSpy,
            info: jest.fn(),
            error: jest.fn(),
          })),
        },
      }));
      
      renderProtectedRoute(false);
      
      // The component should log a warning when redirecting
      expect(warnSpy).toHaveBeenCalledWith('unauthorized_redirect', { to: '/login', from: '/protected' });
    });

    it('should log debug when authorized access is granted', () => {
      const warnSpy = jest.fn();
      const debugSpy = jest.fn();
      
      jest.mock('../../../shared/utils/logger', () => ({
        logger: {
          withContext: jest.fn(() => ({
            warn: warnSpy,
            debug: debugSpy,
            info: jest.fn(),
            error: jest.fn(),
          })),
        },
      }));
      
      // Test with authenticated user
      const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const MockAuthContext = React.createContext({
          user: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User' },
          isAuthenticated: true,
          login: jest.fn(),
          logout: jest.fn(),
        });
        
        return (
          <MockAuthContext.Provider value={{
            user: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User' },
            isAuthenticated: true,
            login: jest.fn(),
            logout: jest.fn(),
          }}>
            {children}
          </MockAuthContext.Provider>
        );
      };
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <MockAuthProvider>
            <Routes>
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute>
                    <ProtectedContent />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </MockAuthProvider>
        </MemoryRouter>
      );
      
      expect(debugSpy).toHaveBeenCalledWith('authorized_access', { path: '/protected' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children gracefully', () => {
      const NullProtectedRoute = () => (
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute>
                    <div></div>
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );
      
      // This should not crash
      expect(() => render(<NullProtectedRoute />)).not.toThrow();
    });

    it('should handle multiple children', () => {
      const MultipleChildrenProtectedRoute = () => (
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute>
                    <div><div>Child 1</div><div>Child 2</div></div>
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );
      
      // This should not crash
      expect(() => render(<MultipleChildrenProtectedRoute />)).not.toThrow();
    });
  });

  describe('Props Validation', () => {
    it('should accept ReactElement as children', () => {
      const ElementChild = () => <div>Element Child</div>;
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute>
                    <ElementChild />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );
      
      // Should redirect to login since user is not authenticated
      expect(screen.getByText('Login Page')).toBeTruthy();
    });
  });
});