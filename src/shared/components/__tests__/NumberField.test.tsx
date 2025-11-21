import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NumberField from '../NumberField';

describe('NumberField Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render number input with basic props', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toBeTruthy();
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render with label', () => {
      render(
        <NumberField
          name="test-number"
          label="Test Label"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('Test Label')).toBeTruthy();
      expect(screen.getByLabelText('Test Label')).toBeTruthy();
    });

    it('should render with custom ID', () => {
      render(
        <NumberField
          id="custom-id"
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('should use name as ID when ID not provided', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('id', 'test-number');
    });

    it('should render with placeholder', () => {
      render(
        <NumberField
          name="test-number"
          placeholder="Enter a number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByPlaceholderText('Enter a number')).toBeTruthy();
    });

    it('should render with description', () => {
      render(
        <NumberField
          name="test-number"
          description="This is a description"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('This is a description')).toBeTruthy();
      expect(screen.getByText('This is a description')).toHaveAttribute('id', 'test-number-desc');
    });

    it('should render with error message', () => {
      render(
        <NumberField
          name="test-number"
          error="This field is required"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('This field is required')).toBeTruthy();
      expect(screen.getByText('This field is required')).toHaveAttribute('id', 'test-number-error');
    });

    it('should render with min value', () => {
      render(
        <NumberField
          name="test-number"
          min={0}
          value={5}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
    });

    it('should render with max value', () => {
      render(
        <NumberField
          name="test-number"
          max={100}
          value={50}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should render with step value', () => {
      render(
        <NumberField
          name="test-number"
          step={0.5}
          value={5.5}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.5');
    });

    it('should render as disabled', () => {
      render(
        <NumberField
          name="test-number"
          disabled
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toBeDisabled();
    });

    it('should render as required', () => {
      render(
        <NumberField
          name="test-number"
          required
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toBeRequired();
    });

    it('should render with required indicator when label and required are provided', () => {
      render(
        <NumberField
          name="test-number"
          label="Test Label"
          required
          value={0}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('*')).toBeTruthy();
      expect(screen.getByText('*')).toHaveClass('text-red-600');
    });
  });

  describe('Value Handling', () => {
    it('should render with positive integer value', () => {
      render(
        <NumberField
          name="test-number"
          value={42}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(42);
    });

    it('should render with negative integer value', () => {
      render(
        <NumberField
          name="test-number"
          value={-42}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(-42);
    });

    it('should render with decimal value', () => {
      render(
        <NumberField
          name="test-number"
          value={3.14}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(3.14);
    });

    it('should render with zero value', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(0);
    });

    it('should render empty string when value is NaN', () => {
      render(
        <NumberField
          name="test-number"
          value={NaN}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(null);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when input value changes', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '42' } });
      
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({
          value: '42',
          name: 'test-number'
        })
      }));
    });

    it('should not call onChange when disabled', () => {
      render(
        <NumberField
          name="test-number"
          disabled
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '42' } });
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should handle decimal input', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '3.14' } });
      
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({
          value: '3.14'
        })
      }));
    });

    it('should handle negative input', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '-42' } });
      
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({
          value: '-42'
        })
      }));
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for invalid state', () => {
      render(
        <NumberField
          name="test-number"
          error="This field has an error"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-errormessage', 'test-number-error');
    });

    it('should have proper ARIA attributes for valid state', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have proper ARIA describedby when description is provided', () => {
      render(
        <NumberField
          name="test-number"
          description="This is a helpful description"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-describedby', 'test-number-desc');
    });

    it('should have proper ARIA describedby when both description and error are provided', () => {
      render(
        <NumberField
          name="test-number"
          description="This is a helpful description"
          error="This field has an error"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-describedby', 'test-number-desc test-number-error');
    });

    it('should have aria-live polite for error messages', () => {
      render(
        <NumberField
          name="test-number"
          error="This field has an error"
          value={0}
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
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveClass('ui-input', 'mt-1');
    });

    it('should have correct container classes', () => {
      const { container } = render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('mb-4');
    });

    it('should have correct label classes', () => {
      render(
        <NumberField
          name="test-number"
          label="Test Label"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700', 'dark:text-gray-300');
    });

    it('should have correct description classes', () => {
      render(
        <NumberField
          name="test-number"
          description="Test description"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const description = screen.getByText('Test description');
      expect(description).toHaveClass('mt-1', 'text-xs', 'text-gray-500');
    });

    it('should have correct error message classes', () => {
      render(
        <NumberField
          name="test-number"
          error="Test error"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const error = screen.getByText('Test error');
      expect(error).toHaveClass('mt-2', 'text-sm', 'text-red-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(0);
    });

    it('should handle undefined optional props', () => {
      render(
        <NumberField
          name="test-number"
          value={0}
          onChange={mockOnChange}
          label={undefined}
          placeholder={undefined}
          description={undefined}
          error={undefined}
          min={undefined}
          max={undefined}
          step={undefined}
        />
      );
      
      expect(screen.queryByRole('label')).toBeFalsy();
      expect(screen.queryByPlaceholderText(/.*/)).toBeFalsy();
      expect(screen.queryByText(/.*/)).toBeFalsy();
      
      const input = screen.getByRole('spinbutton');
      expect(input).not.toHaveAttribute('min');
      expect(input).not.toHaveAttribute('max');
      expect(input).not.toHaveAttribute('step');
    });

    it('should handle very large numbers', () => {
      const largeNumber = 999999999999999;
      render(
        <NumberField
          name="test-number"
          value={largeNumber}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(largeNumber);
    });

    it('should handle very small decimal numbers', () => {
      const smallNumber = 0.000001;
      render(
        <NumberField
          name="test-number"
          value={smallNumber}
          onChange={mockOnChange}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(smallNumber);
    });
  });
});