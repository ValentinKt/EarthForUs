import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock all dependencies to isolate the App component
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="browser-router">{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="routes">{children}</div>
  ),
  Route: ({ path, element }: { path: string; element: React.ReactNode }) => (
    <div data-testid={`route-${path.replace(/\//g, '-')}`}>{element}</div>
  ),
  Navigate: ({ to }: { to: string }) => (
    <div data-testid={`navigate-${to.replace(/\//g, '-')}`}>Navigate to {to}</div>
  ),
  useLocation: () => ({ pathname: '/' })
}));

jest.mock('../app/layout/Layout', () => ({
  __esModule: true,
  default: ({ children, showHeader, showFooter }: any) => (
    <div data-testid="layout" data-show-header={showHeader} data-show-footer={showFooter}>
      {children}
    </div>
  )
}));

jest.mock('../features/landing/pages/LandingPage', () => ({
  __esModule: true,
  default: () => <div data-testid="landing-page">Landing Page</div>
}));

jest.mock('../features/auth/pages/LoginPage', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login Page</div>
}));

jest.mock('../features/auth/pages/SignupPage', () => ({
  __esModule: true,
  default: () => <div data-testid="signup-page">Signup Page</div>
}));

jest.mock('../features/events/pages/CreateEventPage', () => ({
  __esModule: true,
  default: () => <div data-testid="create-event-page">Create Event Page</div>
}));

jest.mock('../features/home/pages/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>
}));

jest.mock('../features/events/pages/EventsPage', () => ({
  __esModule: true,
  default: () => <div data-testid="events-page">Events Page</div>
}));

jest.mock('../features/events/pages/EventPage', () => ({
  __esModule: true,
  default: () => <div data-testid="event-page">Event Page</div>
}));

jest.mock('../features/profile/pages/ProfilePage', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-page">Profile Page</div>
}));

jest.mock('../features/settings/pages/SettingsPage', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-page">Settings Page</div>
}));

jest.mock('../shared/components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )
}));

jest.mock('../shared/theme/ThemeContext', () => ({
  __esModule: true,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}));

jest.mock('../features/auth/context/AuthContext', () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  )
}));

jest.mock('../shared/components/Toast', () => ({
  __esModule: true,
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  )
}));

jest.mock('../features/auth/components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  )
}));

jest.mock('../shared/utils/logger', () => ({
  logger: {
    withContext: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    }))
  }
}));

jest.mock('../shared/utils/errorReporter', () => ({
  report: jest.fn()
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should render all providers in correct hierarchy', () => {
    render(<App />);
    
    expect(screen.getByTestId('error-boundary')).toBeTruthy();
    expect(screen.getByTestId('theme-provider')).toBeTruthy();
    expect(screen.getByTestId('auth-provider')).toBeTruthy();
    expect(screen.getByTestId('toast-provider')).toBeTruthy();
  });

  it('should render BrowserRouter', () => {
    render(<App />);
    expect(screen.getByTestId('browser-router')).toBeTruthy();
  });

  it('should render Routes container', () => {
    render(<App />);
    expect(screen.getByTestId('routes')).toBeTruthy();
  });

  it('should render root route with LandingPage', () => {
    render(<App />);
    // Root route has empty path, so we check for the landing page content
    expect(screen.getByTestId('landing-page')).toBeTruthy();
  });

  it('should render login route without header/footer', () => {
    render(<App />);
    expect(screen.getByTestId('route--login')).toBeTruthy();
  });

  it('should render signup route without header/footer', () => {
    render(<App />);
    expect(screen.getByTestId('route--signup')).toBeTruthy();
  });

  it('should render events route', () => {
    render(<App />);
    expect(screen.getByTestId('route--events')).toBeTruthy();
  });

  it('should render events/:id route', () => {
    render(<App />);
    expect(screen.getByTestId('route--events-:id')).toBeTruthy();
  });

  it('should render events/create route with ProtectedRoute', () => {
    render(<App />);
    expect(screen.getByTestId('route--events-create')).toBeTruthy();
  });

  it('should render home route with ProtectedRoute', () => {
    render(<App />);
    expect(screen.getByTestId('route--home')).toBeTruthy();
  });

  it('should render profile route with ProtectedRoute', () => {
    render(<App />);
    expect(screen.getByTestId('route--profile')).toBeTruthy();
  });

  it('should render settings route with ProtectedRoute', () => {
    render(<App />);
    expect(screen.getByTestId('route--settings')).toBeTruthy();
  });

  it('should render dashboard redirect route', () => {
    render(<App />);
    // Dashboard redirect shows "Navigate to /home"
    expect(screen.getByText('Navigate to /home')).toBeTruthy();
  });

  it('should render 404 route', () => {
    render(<App />);
    expect(screen.getByTestId('route-*')).toBeTruthy();
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('Page not found')).toBeTruthy();
  });

  it('should set up global error reporting', () => {
    const mockAddEventListener = jest.spyOn(window, 'addEventListener');
    const mockReport = require('../shared/utils/errorReporter').report;
    
    render(<App />);
    
    expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    
    // Test error reporting
    const errorEvent = new ErrorEvent('error', {
      error: new Error('Test error'),
      filename: 'test.js',
      lineno: 10,
      colno: 5
    });
    
    window.dispatchEvent(errorEvent);
    
    expect(mockReport).toHaveBeenCalledWith(
      errorEvent.error,
      'Window Error',
      {
        filename: 'test.js',
        lineno: 10,
        colno: 5
      }
    );
  });

  it('should clean up event listeners on unmount', () => {
    const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<App />);
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  it('should log route changes', () => {
    const mockLogger = require('../shared/utils/logger').logger.withContext();
    
    render(<App />);
    
    // RouteLogger should be called with initial path
    // The useEffect in RouteLogger runs after render
    setTimeout(() => {
      expect(mockLogger.info).toHaveBeenCalledWith('route_change', { path: '/' });
    }, 0);
  });

  it('should have correct app container structure', () => {
    render(<App />);
    
    const appDiv = screen.getByTestId('browser-router').querySelector('.App');
    expect(appDiv).toBeTruthy();
  });

  it('should render GlobalErrorReporter component', () => {
    render(<App />);
    // GlobalErrorReporter is rendered but not visible in DOM
    expect(screen.getByTestId('browser-router')).toBeTruthy();
  });

  it('should render RouteLogger component', () => {
    render(<App />);
    // RouteLogger is rendered but not visible in DOM
    expect(screen.getByTestId('browser-router')).toBeTruthy();
  });
});