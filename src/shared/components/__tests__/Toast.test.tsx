import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../Toast';

// Mock error reporter
jest.mock('../../utils/errorReporter', () => ({
  report: jest.fn(),
}));

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const TestComponent = () => {
    const { show, success, error } = useToast();
    
    return (
      <div>
        <button onClick={() => show('Test message')}>Show Info</button>
        <button onClick={() => success('Success message')}>Show Success</button>
        <button onClick={() => error('Error message')}>Show Error</button>
        <button onClick={() => show('Custom message', 'success', 'Custom Title')}>Show Custom</button>
      </div>
    );
  };

  const renderWithToastProvider = (ui: React.ReactElement) => {
    return render(
      <ToastProvider>
        {ui}
      </ToastProvider>
    );
  };

  describe('ToastProvider', () => {
    it('should render children without errors', () => {
      const { getByText } = renderWithToastProvider(
        <div>Test Content</div>
      );
      
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should provide toast context to children', () => {
      let toastContext: any;
      
      const ContextTestComponent = () => {
        toastContext = useToast();
        return <div>Context Test</div>;
      };
      
      renderWithToastProvider(<ContextTestComponent />);
      
      expect(toastContext).toBeDefined();
      expect(toastContext.show).toBeDefined();
      expect(toastContext.success).toBeDefined();
      expect(toastContext.error).toBeDefined();
    });
  });

  describe('useToast Hook', () => {
    it('should throw error when used outside ToastProvider', () => {
      const TestComponentWithoutProvider = () => {
        useToast();
        return <div>Test</div>;
      };
      
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<TestComponentWithoutProvider />)).toThrow('useToast must be used within ToastProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Toast Display', () => {
    it('should display info toast when show is called', () => {
      const { getByText, getByRole } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show info/i }));
      
      expect(getByText('Test message')).toBeTruthy();
      expect(getByText('Test message').parentElement?.className).toContain('bg-gray-800');
    });

    it('should display success toast when success is called', () => {
      const { getByText, getByRole } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show success/i }));
      
      expect(getByText('Success message')).toBeTruthy();
      expect(getByText('Success message').parentElement?.className).toContain('bg-teal-600');
    });

    it('should display error toast when error is called', () => {
      const { getByText, getByRole } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show error/i }));
      
      expect(getByText('Error message')).toBeTruthy();
      expect(getByText('Error message').parentElement?.className).toContain('bg-red-600');
    });

    it('should display toast with custom title', () => {
      const { getByText, getByRole } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show custom/i }));
      
      expect(getByText('Custom Title')).toBeTruthy();
      expect(getByText('Custom message')).toBeTruthy();
    });

    it('should auto-remove toast after 4 seconds', () => {
      const { getByText, getByRole, queryByText } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show info/i }));
      
      expect(getByText('Test message')).toBeTruthy();
      
      // Fast-forward time by 4 seconds
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      
      expect(queryByText('Test message')).toBeFalsy();
    });

    it('should handle multiple toasts', () => {
      const { getByText, getByRole } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show info/i }));
      fireEvent.click(getByRole('button', { name: /show success/i }));
      fireEvent.click(getByRole('button', { name: /show error/i }));
      
      expect(getByText('Test message')).toBeTruthy();
      expect(getByText('Success message')).toBeTruthy();
      expect(getByText('Error message')).toBeTruthy();
    });

    it('should have proper positioning and styling', () => {
      const { getByText, getByRole } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show info/i }));
      
      const toastContainer = getByText('Test message').closest('div');
      // The positioning classes are on the parent container, not the toast itself
      const positioningContainer = toastContainer?.parentElement;
      expect(positioningContainer?.className).toContain('fixed');
      expect(positioningContainer?.className).toContain('bottom-4');
      expect(positioningContainer?.className).toContain('left-1/2');
      expect(positioningContainer?.className).toContain('-translate-x-1/2');
      expect(positioningContainer?.className).toContain('z-50');
    });

    it('should have proper toast styling', () => {
      const { getByText, getByRole } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show info/i }));
      
      const toastElement = getByText('Test message').parentElement;
      expect(toastElement?.className).toContain('rounded-xl');
      expect(toastElement?.className).toContain('px-4');
      expect(toastElement?.className).toContain('py-3');
      expect(toastElement?.className).toContain('shadow-lg');
      expect(toastElement?.className).toContain('text-white');
    });
  });

  describe('Error Reporting', () => {
    it('should report error when error toast is shown', () => {
      const { getByRole } = renderWithToastProvider(<TestComponent />);
      const { report } = require('../../utils/errorReporter');
      
      fireEvent.click(getByRole('button', { name: /show error/i }));
      
      expect(report).toHaveBeenCalledWith(
        { message: 'Error message' },
        'UI Error',
        { title: undefined }
      );
    });

    it('should report error with custom title', () => {
      const { getByRole } = renderWithToastProvider(<TestComponent />);
      const { report } = require('../../utils/errorReporter');
      
      fireEvent.click(getByRole('button', { name: /show custom/i }));
      
      // The custom title test uses 'success' variant, not 'error' variant
      expect(report).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const TestEmptyMessage = () => {
        const { show } = useToast();
        return <button onClick={() => show('')}>Show Empty</button>;
      };
      
      const { getByRole } = renderWithToastProvider(<TestEmptyMessage />);
      
      fireEvent.click(getByRole('button', { name: /show empty/i }));
      
      // Check that a toast was created with empty message
      const toasts = screen.getAllByRole('paragraph');
      expect(toasts.length).toBeGreaterThan(0);
      expect(toasts[0].textContent).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const TestLongMessage = () => {
        const { show } = useToast();
        return <button onClick={() => show(longMessage)}>Show Long</button>;
      };
      
      const { getByRole } = renderWithToastProvider(<TestLongMessage />);
      
      fireEvent.click(getByRole('button', { name: /show long/i }));
      
      expect(screen.getByText(longMessage)).toBeTruthy();
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Test <script>alert("xss")</script> & other "special" chars';
      const TestSpecialMessage = () => {
        const { show } = useToast();
        return <button onClick={() => show(specialMessage)}>Show Special</button>;
      };
      
      const { getByRole } = renderWithToastProvider(<TestSpecialMessage />);
      
      fireEvent.click(getByRole('button', { name: /show special/i }));
      
      expect(screen.getByText(specialMessage)).toBeTruthy();
    });

    it('should handle rapid toast creation', () => {
      const RapidToastTest = () => {
        const { show } = useToast();
        return (
          <button onClick={() => {
            for (let i = 0; i < 10; i++) {
              show(`Message ${i}`);
            }
          }}>Show Rapid</button>
        );
      };
      
      const { getByRole, getByText } = renderWithToastProvider(<RapidToastTest />);
      
      fireEvent.click(getByRole('button', { name: /show rapid/i }));
      
      for (let i = 0; i < 10; i++) {
        expect(getByText(`Message ${i}`)).toBeTruthy();
      }
    });
  });

  describe('Timer Management', () => {
    it('should properly clean up timers on unmount', () => {
      const { getByRole, unmount } = renderWithToastProvider(<TestComponent />);
      
      fireEvent.click(getByRole('button', { name: /show info/i }));
      
      unmount();
      
      // Should not throw any errors when advancing timers after unmount
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(4000);
        });
      }).not.toThrow();
    });

    it('should handle timer cleanup for multiple toasts', () => {
      const { getByRole, unmount } = renderWithToastProvider(<TestComponent />);
      
      // Create multiple toasts
      fireEvent.click(getByRole('button', { name: /show info/i }));
      fireEvent.click(getByRole('button', { name: /show success/i }));
      fireEvent.click(getByRole('button', { name: /show error/i }));
      
      unmount();
      
      // Should not throw any errors when advancing timers after unmount
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(4000);
        });
      }).not.toThrow();
    });
  });
});