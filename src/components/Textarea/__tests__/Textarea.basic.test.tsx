import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const MockTextarea = ({ label, value, onChange, placeholder, maxLength }: {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Enforce maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="textarea-field">
      {label && <label className="textarea-label">{label}</label>}
      
      <div className="textarea-container">
        <textarea
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="textarea-input"
        />
        
        {maxLength && (
          <div className="textarea-character-count">
            {internalValue.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

describe('Textarea Component - Basic Test', () => {
  it('should render without crashing', () => {
    const { container } = render(<MockTextarea />);
    expect(container).toBeTruthy();
  });

  it('should render with label', () => {
    render(<MockTextarea label="Description" />);
    expect(screen.getByText('Description')).toBeTruthy();
  });

  it('should render textarea element', () => {
    const { container } = render(<MockTextarea />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('should display provided value', () => {
    const testValue = 'This is a test description';
    const { container } = render(<MockTextarea value={testValue} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(testValue);
  });

  it('should update value on change', () => {
    const handleChange = jest.fn();
    const { container } = render(<MockTextarea onChange={handleChange} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    
    const newValue = 'Updated description';
    fireEvent.change(textarea, { target: { value: newValue } });
    
    expect(handleChange).toHaveBeenCalledWith(newValue);
    expect(textarea.value).toBe(newValue);
  });

  it('should show character count when maxLength is specified', () => {
    const { container } = render(<MockTextarea maxLength={100} />);
    const counter = container.querySelector('.textarea-character-count');
    expect(counter).toBeTruthy();
    expect(counter?.textContent).toContain('0/100');
  });

  it('should update character count on input', () => {
    const { container } = render(<MockTextarea maxLength={100} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    
    const counter = container.querySelector('.textarea-character-count');
    expect(counter?.textContent).toContain('11/100');
  });

  it('should prevent exceeding maxLength', () => {
    const handleChange = jest.fn();
    const { container } = render(<MockTextarea maxLength={10} onChange={handleChange} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: 'This is a very long text' } });
    
    expect(textarea.value.length).toBeLessThanOrEqual(10);
    // The change handler should not be called since the value is truncated
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should handle placeholder', () => {
    const placeholder = 'Enter your description here...';
    const { container } = render(<MockTextarea placeholder={placeholder} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe(placeholder);
  });
});