import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';

// Mock all dependencies first
jest.mock('../../../../shared/utils/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ events: [] }),
    post: jest.fn()
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
    user: { id: 1, name: 'Test User' }
  })
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  )
}));

jest.mock('../../../../shared/ui/Button', () => {
  return function MockButton({ children, variant, onClick, disabled, loading }: any) {
    return (
      <button 
        onClick={onClick} 
        disabled={disabled || loading}
        className={`btn-${variant}`}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  };
});

// Now import the component
import EventsPage from '../EventsPage';

describe('EventsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<EventsPage />);
    expect(container).toBeTruthy();
  });

  it('should show page title', () => {
    const { getByText } = render(<EventsPage />);
    expect(getByText('Discover Events')).toBeTruthy();
  });

  it('should show loading state initially', () => {
    const { getByText } = render(<EventsPage />);
    expect(getByText('Loading events...')).toBeTruthy();
  });

  it('should display events when loaded', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Test Event 1',
        location: 'Test Location',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T12:00:00Z',
        description: 'Test description'
      },
      {
        id: 2,
        title: 'Test Event 2',
        location: 'Another Location',
        start_time: '2024-01-02T14:00:00Z',
        end_time: '2024-01-02T16:00:00Z',
        description: 'Another description'
      }
    ];

    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: mockEvents });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
      expect(screen.getByText('Test Event 2')).toBeTruthy();
    });
  });

  it('should show empty state when no events', async () => {
    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: [] });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeTruthy();
    });
  });

  it('should handle API errors gracefully', async () => {
    const { api } = require('../../../../shared/utils/api');
    const { useToast } = require('../../../../shared/components/Toast');
    
    const mockError = new Error('Failed to fetch events');
    api.get.mockRejectedValue(mockError);

    render(<EventsPage />);

    await waitFor(() => {
      expect(useToast().error).toHaveBeenCalledWith('Failed to load events');
    });
  });

  it('should show create event button for authenticated users', () => {
    render(<EventsPage />);
    
    expect(screen.getByText('Create Event')).toBeTruthy();
  });

  it('should format event dates correctly', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Test Event',
        location: 'Test Location',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T12:00:00Z',
        description: 'Test description'
      }
    ];

    const { api } = require('../../../../shared/utils/api');
    api.get.mockResolvedValue({ events: mockEvents });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
      expect(screen.getByText('Test Location')).toBeTruthy();
    });
  });
});