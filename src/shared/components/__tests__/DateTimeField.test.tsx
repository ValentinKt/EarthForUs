import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateTimeField from '../DateTimeField';

describe('DateTimeField Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render datetime input with basic props', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeTruthy();
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'datetime-local');
    });

    it('should render with custom ID', () => {
      render(
        <DateTimeField
          id="custom-id"
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('should use name as ID when ID not provided', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('id', 'test-datetime');
    });

    it('should render with description', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          description="This is a description"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('This is a description')).toBeTruthy();
      expect(screen.getByText('This is a description')).toHaveAttribute('id', 'test-datetime-desc');
    });

    it('should render with error message', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          error="This field is required"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('This field is required')).toBeTruthy();
      expect(screen.getByText('This field is required')).toHaveAttribute('id', 'test-datetime-error');
    });

    it('should render as disabled', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          disabled
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeDisabled();
    });

    it('should render as required', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          required
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeRequired();
      expect(screen.getByText('*')).toBeTruthy();
      expect(screen.getByText('*')).toHaveClass('text-red-600');
    });

    it('should render with min value', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          min="2023-01-01T00:00"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('min', '2023-01-01T00:00');
    });

    it('should render with max value', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          max="2023-12-31T23:59"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('max', '2023-12-31T23:59');
    });
  });

  describe('Value Handling', () => {
    it('should render with valid datetime value', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveValue('2023-12-25T10:30');
    });

    it('should render with empty value', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value=""
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveValue('');
    });

    it('should render with ISO datetime format', () => {
      const isoDate = new Date('2023-12-25T10:30:00.000Z').toISOString();
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value={isoDate}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      // The input should handle the ISO format
      expect(input).toHaveValue(isoDate);
    });

    it('should handle different datetime formats', () => {
      const testCases = [
        '2023-12-25T10:30',
        '2023-12-25T10:30:00',
        '2023-12-25T10:30:00.000',
        '2023-12-25T10:30:00.000Z'
      ];

      testCases.forEach((dateTime) => {
        const { unmount } = render(
          <DateTimeField
            name="test-datetime"
            label="Test Label"
            value={dateTime}
            onChange={mockOnChange}
          />
        );
        
        const input = screen.getByLabelText('Test Label');
        expect(input).toHaveValue(dateTime);
        
        unmount();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when input value changes', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      fireEvent.change(input, { target: { value: '2023-12-26T14:45' } });
      
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({
          value: '2023-12-26T14:45',
          name: 'test-datetime'
        })
      }));
    });

    it('should not call onChange when disabled', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          disabled
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      fireEvent.change(input, { target: { value: '2023-12-26T14:45' } });
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for invalid state', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          error="This field has an error"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-errormessage', 'test-datetime-error');
    });

    it('should have proper ARIA attributes for valid state', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have proper ARIA describedby when description is provided', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          description="This is a helpful description"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-describedby', 'test-datetime-desc');
    });

    it('should have proper ARIA describedby when both description and error are provided', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          description="This is a helpful description"
          error="This field has an error"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-describedby', 'test-datetime-desc test-datetime-error');
    });

    it('should have aria-live polite for error messages', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          error="This field has an error"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const errorMessage = screen.getByText('This field has an error');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Styling', () => {
    it('should have correct base classes', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveClass('ui-input', 'mt-1');
    });

    it('should have correct container classes', () => {
      const { container } = render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('mb-4');
    });

    it('should have correct label classes', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700', 'dark:text-gray-300');
    });

    it('should have correct description classes', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          description="Test description"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const description = screen.getByText('Test description');
      expect(description).toHaveClass('mt-1', 'text-xs', 'text-gray-500');
    });

    it('should have correct error message classes', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          error="Test error"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
        />
      );
      
      const error = screen.getByText('Test error');
      expect(error).toHaveClass('mt-2', 'text-sm', 'text-red-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value=""
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveValue('');
    });

    it('should handle undefined optional props', () => {
      render(
        <DateTimeField
          name="test-datetime"
          label="Test Label"
          value="2023-12-25T10:30"
          onChange={mockOnChange}
          description={undefined}
          error={undefined}
          min={undefined}
          max={undefined}
        />
      );
      
      expect(screen.queryByText(/.*/)).toBeFalsy();
      
      const input = screen.getByLabelText('Test Label');
      expect(input).not.toHaveAttribute('min');
      expect(input).not.toHaveAttribute('max');
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDates = [
        'invalid-date',
        '2023-13-45T25:70', // Invalid month and time
        '',
        'not-a-date-at-all'
      ];

      invalidDates.forEach((invalidDate) => {
        const { unmount } = render(
          <DateTimeField
            name="test-datetime"
            label="Test Label"
            value={invalidDate}
            onChange={mockOnChange}
          />
        );
        
        const input = screen.getByLabelText('Test Label');
        expect(input).toHaveValue(invalidDate);
        
        unmount();
      });
    });

    it('should handle very old and very future dates', () => {
      const extremeDates = [
        '1900-01-01T00:00',
        '2100-12-31T23:59',
        '1970-01-01T00:00', // Unix epoch
        '2038-01-19T03:14:07' // 32-bit Unix timestamp limit
      ];

      extremeDates.forEach((date) => {
        const { unmount } = render(
          <DateTimeField
            name="test-datetime"
            label="Test Label"
            value={date}
            onChange={mockOnChange}
          />
        );
        
        const input = screen.getByLabelText('Test Label');
        expect(input).toHaveValue(date);
        
        unmount();
      });
    });
  });
});