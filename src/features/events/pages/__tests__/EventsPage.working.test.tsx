import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock API functions
const mockGet = jest.fn();
const mockPost = jest.fn();

// Mock only the API module
jest.mock('../../../../shared/utils/api', () => ({
  api: {
    get: mockGet,
    post: mockPost
  }
}));

// Mock useAuth to provide a user
jest.mock('../../../auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' }
  })
}));

// Mock useToast to avoid ToastProvider requirement
jest.mock('../../../../shared/components/Toast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

// Mock logger to avoid context issues
jest.mock('../../../../shared/utils/logger', () => ({
  logger: {
    withContext: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      group: jest.fn(() => ({ end: jest.fn() })),
      time: jest.fn(() => ({ end: jest.fn() }))
    }))
  }
}));

// Mock Button component
jest.mock('../../../../shared/ui/Button', () => {
  return function MockButton({ children, variant, onClick, disabled, loading, ...props }: any) {
    return (
      <button 
        onClick={onClick} 
        disabled={disabled || loading}
        data-testid={`button-${variant}`}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  };
});

// Mock Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to.replace('/', '')}`}>{children}</a>
  )
}));

// Import component after mocks are set up
import EventsPage from '../EventsPage';

// Helper to render with router
const renderEventsPage = () => {
  return render(
    <MemoryRouter>
      <EventsPage />
    </MemoryRouter>
  );
};

describe('EventsPage Component - Working Version', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior
    mockGet.mockResolvedValue({ events: [] });
  });

  it('should render without crashing', () => {
    const { container } = renderEventsPage();
    expect(container).toBeTruthy();
  });

  it('should display the page title', () => {
    renderEventsPage();
    expect(screen.getByText('Discover Events')).toBeTruthy();
  });

  it('should show loading state initially', () => {
    renderEventsPage();
    // Should show skeleton loading cards instead of text
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3);
  });

  it('should display events when loaded', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Community Cleanup',
        location: 'Central Park',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T14:00:00Z',
        description: 'Join us for a community cleanup event'
      }
    ];

    mockGet.mockResolvedValue({ events: mockEvents });
    renderEventsPage();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Central Park')).toBeTruthy();
    });
  });

  it('should show empty state when no events', async () => {
    mockGet.mockResolvedValue({ events: [] });
    renderEventsPage();

    await waitFor(() => {
      expect(screen.getByText('No upcoming events')).toBeTruthy();
      expect(screen.getByText('Be the first to create one for your community.')).toBeTruthy();
    });
  });

  it('should show Create Event button', () => {
    renderEventsPage();
    expect(screen.getByText('Create Event')).toBeTruthy();
    expect(screen.getByTestId('button-forest')).toBeTruthy();
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockGet.mockRejectedValue(mockError);
    renderEventsPage();

    await waitFor(() => {
      // Should still render the page even with error
      expect(screen.getByText('Discover Events')).toBeTruthy();
    });
  });

  it('should show Join buttons for events', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Community Cleanup',
        location: 'Central Park',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T14:00:00Z',
        description: 'Join us for a community cleanup event'
      }
    ];

    mockGet.mockResolvedValue({ events: mockEvents });
    renderEventsPage();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Join')).toBeTruthy();
    });
  });

  it('should handle Join button click', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Community Cleanup',
        location: 'Central Park',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T14:00:00Z',
        description: 'Join us for a community cleanup event'
      }
    ];

    mockGet.mockResolvedValue({ events: mockEvents });
    mockPost.mockResolvedValue({ status: 'success' });
    
    renderEventsPage();

    await waitFor(() => {
      expect(screen.getByText('Join')).toBeTruthy();
    });

    const joinButton = screen.getByText('Join');
    joinButton.click();

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/events/1/join', { user_id: 1 });
    });
  });
});