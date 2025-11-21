import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextField from '../TextField';

describe('TextField Component', () => {
  const defaultProps = {
    name: 'testField',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render text input with default props', () => {
      render(<TextField {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeTruthy();
      expect(input.getAttribute('name')).toBe('testField');
      expect(input.getAttribute('type')).toBe('text');
    });

    it('should render with custom id', () => {
      render(<TextField {...defaultProps} id="custom-id" />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('id')).toBe('custom-id');
    });

    it('should use name as id when id is not provided', () => {
      render(<TextField {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('id')).toBe('testField');
    });

    it('should render with label', () => {
      render(<TextField {...defaultProps} label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeTruthy();
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('id')).toBe('testField');
    });

    it('should render required indicator when required', () => {
      render(<TextField {...defaultProps} label="Test Label" required />);
      const label = screen.getByText('*');
      expect(label).toBeTruthy();
      expect(label.tagName.toLowerCase()).toBe('span');
    });

    it('should render with placeholder', () => {
      render(<TextField {...defaultProps} placeholder="Enter text" />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should render with description', () => {
      render(<TextField {...defaultProps} description="This is a description" />);
      expect(screen.getByText('This is a description')).toBeTruthy();
    });

    it('should render with error message', () => {
      render(<TextField {...defaultProps} error="This is an error" />);
      expect(screen.getByText('This is an error')).toBeTruthy();
    });

    it('should render as disabled', () => {
      render(<TextField {...defaultProps} disabled />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should render with different input types', () => {
      const { rerender } = render(<TextField {...defaultProps} type="email" />);
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');

      rerender(<TextField {...defaultProps} type="password" />);
      input = screen.getByDisplayValue('') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should render with autoComplete', () => {
      render(<TextField {...defaultProps} autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('autocomplete')).toBe('email');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<TextField {...defaultProps} onChange={onChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'new value' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should update input value', () => {
      const { rerender } = render(<TextField {...defaultProps} value="initial" />);
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      rerender(<TextField {...defaultProps} value="updated" />);
      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('updated');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when invalid', () => {
      render(<TextField {...defaultProps} error="Validation error" />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-errormessage')).toBe('testField-error');
    });

    it('should have proper ARIA attributes when valid', () => {
      render(<TextField {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-invalid')).toBe('false');
    });

    it('should have aria-describedby when description is provided', () => {
      render(<TextField {...defaultProps} description="Field description" />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-describedby')).toContain('testField-desc');
    });

    it('should have aria-describedby when error is provided', () => {
      render(<TextField {...defaultProps} error="Field error" />);
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-describedby')).toContain('testField-error');
    });

    it('should have both description and error in aria-describedby', () => {
      render(
        <TextField 
          {...defaultProps} 
          description="Field description" 
          error="Field error" 
        />
      );
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('testField-desc');
      expect(describedBy).toContain('testField-error');
    });

    it('should have aria-live on error message', () => {
      render(<TextField {...defaultProps} error="Field error" />);
      const errorMessage = screen.getByText('Field error');
      expect(errorMessage.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      render(<TextField {...defaultProps} value="" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle undefined optional props', () => {
      render(
        <TextField 
          {...defaultProps} 
          label={undefined}
          placeholder={undefined}
          description={undefined}
          error={undefined}
          autoComplete={undefined}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeTruthy();
    });

    it('should handle custom className', () => {
      render(<TextField {...defaultProps} className="custom-class" />);
      const container = screen.getByRole('textbox').parentElement;
      expect(container?.className).toContain('mb-4');
    });
  });
});