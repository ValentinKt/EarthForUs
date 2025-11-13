import React from 'react';

type NumberFieldProps = {
  id?: string;
  name: string;
  label?: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export default function NumberField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  description,
  min,
  max,
  step,
  disabled,
}: NumberFieldProps) {
  const inputId = id || name;
  const descId = description ? `${inputId}-desc` : undefined;
  const errId = error ? `${inputId}-error` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);
  return (
    <div className="mb-4">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required ? <span className="text-red-600">*</span> : null}
        </label>
      ) : null}
      {description ? (
        <p id={descId} className="mt-1 text-xs text-gray-500">{description}</p>
      ) : null}
      <input
        id={inputId}
        name={name}
        type="number"
        value={Number.isNaN(value) ? '' : value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`mt-1 block w-full rounded-md border ${invalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-500'} shadow-sm focus:border-brand-500 dark:bg-gray-800 dark:text-white`}
      />
      {error ? (
        <p id={errId} className="mt-2 text-sm text-red-600" aria-live="polite">{error}</p>
      ) : null}
    </div>
  );
}
