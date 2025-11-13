import React from 'react';

type DateTimeFieldProps = {
  id?: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
};

export default function DateTimeField({
  id,
  name,
  label,
  value,
  onChange,
  required,
  error,
  description,
  disabled,
  min,
  max,
}: DateTimeFieldProps) {
  const inputId = id || name;
  const descId = description ? `${inputId}-desc` : undefined;
  const errId = error ? `${inputId}-error` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {description ? (
        <p id={descId} className="mt-1 text-xs text-gray-500">{description}</p>
      ) : null}
      <input
        id={inputId}
        name={name}
        type="datetime-local"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        min={min}
        max={max}
        className={`mt-1 block w-full rounded-md border ${invalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-500'} shadow-sm focus:border-brand-500 dark:bg-gray-800 dark:text-white`}
      />
      {error ? (
        <p id={errId} className="mt-2 text-sm text-red-600" aria-live="polite">{error}</p>
      ) : null}
    </div>
  );
}
