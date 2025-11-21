import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Simple mock approach - just mock the API calls
const mockGet = jest.fn();
const mockPost = jest.fn();

// Mock only the API module
jest.mock('../../../../shared/utils/api', () => ({
  api: {
    get: mockGet,
    post: mockPost
  }
}));

// Import component after mocks
import EventsPage from '../EventsPage';

describe('EventsPage Component - Simplified', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior
    mockGet.mockResolvedValue({ events: [] });
  });

  it('should render without crashing', () => {
    const { container } = render(<EventsPage />);
    expect(container).toBeTruthy();
  });

  it('should display the page title', () => {
    render(<EventsPage />);
    expect(screen.getByText('Discover Events')).toBeTruthy();
  });

  it('should show loading state initially', () => {
    render(<EventsPage />);
    expect(screen.getByText('Loading events...')).toBeTruthy();
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
    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Central Park')).toBeTruthy();
    });
  });

  it('should show empty state when no events', async () => {
    mockGet.mockResolvedValue({ events: [] });
    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeTruthy();
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockGet.mockRejectedValue(mockError);
    render(<EventsPage />);

    await waitFor(() => {
      // Should show error message or handle gracefully
      expect(screen.getByText('Discover Events')).toBeTruthy(); // Page still renders
    });
  });
});