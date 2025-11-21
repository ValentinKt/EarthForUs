// Test to debug EventsPage import issues
import * as React from 'react';

// Import component BEFORE mocks to avoid circular dependency
let EventsPage: any;
try {
  EventsPage = require('../EventsPage').default;
  console.log('EventsPage imported successfully:', typeof EventsPage);
} catch (error) {
  console.error('Failed to import EventsPage:', error);
}

// Now set up mocks after component is imported
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

import { render } from '@testing-library/react';

describe('EventsPage Component - Debug', () => {
  it('should verify EventsPage is defined', () => {
    expect(EventsPage).toBeDefined();
    expect(typeof EventsPage).toBe('function');
  });

  it('should render without crashing', () => {
    if (EventsPage) {
      const { container } = render(<EventsPage />);
      expect(container).toBeTruthy();
    } else {
      console.error('EventsPage is undefined');
    }
  });
});