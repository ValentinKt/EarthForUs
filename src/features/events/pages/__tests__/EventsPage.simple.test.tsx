import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';

// Start with minimal mocking and add gradually
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

// Import after mocks are set up
import EventsPage from '../EventsPage';

describe('EventsPage Component - Simplified', () => {
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
});