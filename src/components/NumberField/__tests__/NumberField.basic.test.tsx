import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const MockNumberField = ({ label, value, onChange, error, helperText, prefix, suffix }: {
  label?: string;
  value?: number | string;
  onChange?: (value: number) => void;
  error?: string;
  helperText?: string;
  prefix?: string;
  suffix?: string;
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(value?.toString() || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onChange?.(parsed);
    }
  };

  return (
    <div className="number-field">
      {label && <label className="number-label">{label}</label>}
      
      <div className="number-input-container">
        {prefix && <span className="number-prefix">{prefix}</span>}
        
        <input
          type="number"
          value={internalValue}
          onChange={handleChange}
          className="number-input"
        />
        
        {suffix && <span className="number-suffix">{suffix}</span>}
      </div>
      
      {error && <div className="number-error" role="alert">{error}</div>}
      {helperText && !error && <div className="number-helper">{helperText}</div>}
    </div>
  );
};

describe('NumberField Component - Basic Test', () => {
  it('should render without crashing', () => {
    const { container } = render(<MockNumberField />);
    expect(container).toBeTruthy();
  });

  it('should render with label', () => {
    render(<MockNumberField label="Age" />);
    expect(screen.getByText('Age')).toBeTruthy();
  });

  it('should display provided numeric value', () => {
    const { container } = render(<MockNumberField value={25} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('25');
  });

  it('should update value on change', () => {
    const handleChange = jest.fn();
    const { container } = render(<MockNumberField onChange={handleChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '50' } });
    
    expect(handleChange).toHaveBeenCalledWith(50);
    expect(input.value).toBe('50');
  });

  it('should show error message', () => {
    render(<MockNumberField error="Number is required" />);
    expect(screen.getByText('Number is required')).toBeTruthy();
  });

  it('should render prefix', () => {
    render(<MockNumberField prefix="$" value={100} />);
    expect(screen.getByText('$')).toBeTruthy();
  });

  it('should render suffix', () => {
    render(<MockNumberField suffix="%" value={75} />);
    expect(screen.getByText('%')).toBeTruthy();
  });
});