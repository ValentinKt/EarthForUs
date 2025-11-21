import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';

// Mock ALL dependencies comprehensively
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to.replace('/', '')}`}>{children}</a>
  )
}));

jest.mock('../../../../shared/utils/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ events: [] }),
    post: jest.fn().mockResolvedValue({ status: 'success' })
  }
}));

jest.mock('../../../../shared/components/Toast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

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

jest.mock('../../../auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' }
  })
}));

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

// Import component AFTER all mocks are set up
import EventsPage from '../EventsPage';

describe('EventsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset API mock to default behavior
    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: [] });
  });

  it('should render without crashing', () => {
    const { container } = render(<EventsPage />);
    expect(container).toBeTruthy();
  });

  it('should display page title', () => {
    render(<EventsPage />);
    expect(screen.getByText('Discover Events')).toBeTruthy();
  });

  it('should show loading state initially', () => {
    render(<EventsPage />);
    expect(screen.getByText('Loading events...')).toBeTruthy();
  });

  it('should display events when data loads', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Community Cleanup',
        location: 'Central Park',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T14:00:00Z',
        description: 'Join us for a community cleanup event'
      },
      {
        id: 2,
        title: 'Tree Planting',
        location: 'Riverside Garden',
        start_time: '2024-01-20T09:00:00Z',
        end_time: '2024-01-20T12:00:00Z',
        description: 'Help plant trees in the community garden'
      }
    ];

    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: mockEvents });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Tree Planting')).toBeTruthy();
      expect(screen.getByText('Central Park')).toBeTruthy();
      expect(screen.getByText('Riverside Garden')).toBeTruthy();
    });
  });

  it('should show empty state when no events', async () => {
    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: [] });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeTruthy();
      expect(screen.getByText('Be the first to create one!')).toBeTruthy();
    });
  });

  it('should show error message when API fails', async () => {
    const { api } = require('../../../../shared/utils/api');
    const { useToast } = require('../../../../shared/components/Toast');
    
    const mockError = new Error('Network error');
    api.get.mockRejectedValue(mockError);

    render(<EventsPage />);

    await waitFor(() => {
      expect(useToast().error).toHaveBeenCalledWith('Failed to load events');
    });
  });

  it('should show Create Event button for authenticated users', () => {
    render(<EventsPage />);
    
    expect(screen.getByText('Create Event')).toBeTruthy();
    expect(screen.getByTestId('button-earth')).toBeTruthy();
  });

  it('should show Join buttons for each event', async () => {
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

    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: mockEvents });

    render(<EventsPage />);

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

    const { api } = require('../../../../shared/utils/api');
    const { useToast } = require('../../../../shared/components/Toast');
    
    api.get.mockResolvedValue({ events: mockEvents });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Join')).toBeTruthy();
    });

    const joinButton = screen.getByText('Join');
    joinButton.click();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/events/1/join', { user_id: 1 });
      expect(useToast().success).toHaveBeenCalledWith('Joined event', 'Joined');
    });
  });

  it('should show date and time information', async () => {
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

    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: mockEvents });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      // Should show some date/time information
      expect(screen.getByText(/Jan 15/)).toBeTruthy();
    });
  });
});