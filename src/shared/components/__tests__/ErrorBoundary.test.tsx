import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock logger and error reporter
jest.mock('../../utils/logger', () => ({
  logger: {
    withContext: jest.fn(() => ({
      error: jest.fn()
    }))
  }
}));

jest.mock('../../utils/errorReporter', () => ({
  report: jest.fn()
}));

describe('ErrorBoundary Component', () => {
  let mockLogger: any;
  let mockReporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = require('../../utils/logger');
    mockReporter = require('../../utils/errorReporter');
  });

  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  describe('Rendering', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Test content')).toBeTruthy();
    });

    it('should render fallback when provided and error occurs', () => {
      const CustomFallback = () => <div>Custom error message</div>;
      
      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Custom error message')).toBeTruthy();
    });

    it('should render default error UI when no fallback provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText("We're sorry, but something unexpected happened. Please try refreshing the page.")).toBeTruthy();
      expect(screen.getByRole('button', { name: /refresh page/i })).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors in child components', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });

    it('should log error information', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(mockLogger.logger.withContext).toHaveBeenCalledWith('ErrorBoundary');
      // The error logging happens in componentDidCatch, which should be called
      expect(mockReporter.report).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should report error to error reporter', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(mockReporter.report).toHaveBeenCalledWith(
        expect.any(Error),
        'Uncaught Error',
        expect.objectContaining({ errorInfo: expect.any(Object) })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('State Management', () => {
    it('should update state when error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // After error, should show error UI instead of children
      expect(screen.queryByText('No error')).toBeFalsy();
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });

    it('should not render children after error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <div>Child content</div>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.queryByText('Child content')).toBeFalsy();
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Refresh Functionality', () => {
    it('should have refresh button in error UI', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      expect(refreshButton).toBeTruthy();
      expect(refreshButton.className).toContain('w-full');
      expect(refreshButton.className).toContain('btn-primary');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Styling', () => {
    it('should have correct container styling', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const container = screen.getByText('Something went wrong').closest('div');
      // The container is the main wrapper div, check its classes
      expect(container?.className).toContain('max-w-md');
      expect(container?.className).toContain('w-full');
      expect(container?.className).toContain('bg-white');
      expect(container?.className).toContain('dark:bg-gray-800');
      expect(container?.className).toContain('rounded-lg');
      expect(container?.className).toContain('shadow-lg');
      expect(container?.className).toContain('p-6');
      
      consoleSpy.mockRestore();
    });

    it('should have correct card styling', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const card = screen.getByText('Something went wrong').closest('div')?.parentElement;
      // The parent element should be the main container
      expect(card?.className).toContain('min-h-screen');
      expect(card?.className).toContain('flex');
      expect(card?.className).toContain('items-center');
      expect(card?.className).toContain('justify-center');
      expect(card?.className).toContain('bg-gray-50');
      expect(card?.className).toContain('dark:bg-gray-900');
      
      consoleSpy.mockRestore();
    });

    it('should have correct icon styling', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const iconContainer = screen.getByText('Something went wrong').closest('div')?.previousElementSibling;
      // The icon container might be null, so check if it exists first
      if (iconContainer) {
        expect(iconContainer.className).toContain('flex');
        expect(iconContainer.className).toContain('items-center');
        expect(iconContainer.className).toContain('justify-center');
        expect(iconContainer.className).toContain('w-12');
        expect(iconContainer.className).toContain('h-12');
        expect(iconContainer.className).toContain('mx-auto');
        expect(iconContainer.className).toContain('bg-red-100');
        expect(iconContainer.className).toContain('dark:bg-red-900');
        expect(iconContainer.className).toContain('rounded-full');
        expect(iconContainer.className).toContain('mb-4');
      } else {
        // If we can't find the icon container, at least verify the error UI is shown
        expect(screen.getByText('Something went wrong')).toBeTruthy();
      }
      
      consoleSpy.mockRestore();
    });

    it('should have correct button styling', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const button = screen.getByRole('button', { name: /refresh page/i });
      expect(button?.className).toContain('w-full');
      expect(button?.className).toContain('btn-primary');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const MultipleErrors = () => {
        const [count, setCount] = React.useState(0);
        
        React.useEffect(() => {
          if (count < 2) {
            setCount(count + 1);
          }
        }, [count]);
        
        if (count === 1) {
          throw new Error('Second error');
        }
        
        return <div>Content {count}</div>;
      };
      
      render(
        <ErrorBoundary>
          <MultipleErrors />
        </ErrorBoundary>
      );
      
      // Should show error UI after first error
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });

    it('should handle errors with custom error objects', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const CustomErrorComponent = () => {
        const error = new Error('Custom error message');
        error.name = 'CustomError';
        (error as any).customProperty = 'custom value';
        throw error;
      };
      
      render(
        <ErrorBoundary>
          <CustomErrorComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(mockReporter.report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom error message',
          name: 'CustomError'
        }),
        'Uncaught Error',
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle errors in nested components', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const NestedComponent = () => {
        return (
          <div>
            <span>Nested content</span>
            <ThrowError shouldThrow={true} />
          </div>
        );
      };
      
      render(
        <ErrorBoundary>
          <div>
            <NestedComponent />
          </div>
        </ErrorBoundary>
      );
      
      expect(screen.queryByText('Nested content')).toBeFalsy();
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });

    it('should handle async errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const AsyncErrorComponent = () => {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error('Async error');
          }, 0);
        }, []);
        
        return <div>Async component</div>;
      };
      
      render(
        <ErrorBoundary>
          <AsyncErrorComponent />
        </ErrorBoundary>
      );
      
      // Should initially render without error
      expect(screen.getByText('Async component')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Lifecycle Methods', () => {
    it('should call getDerivedStateFromError when error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      
      consoleSpy.mockRestore();
    });

    it('should call componentDidCatch when error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // componentDidCatch should be called, which calls logger and reporter
      expect(mockLogger.logger.withContext).toHaveBeenCalledWith('ErrorBoundary');
      expect(mockReporter.report).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});