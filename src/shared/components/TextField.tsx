import * as React from 'react';

type TextFieldProps = {
  id?: string;
  name: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
};

export default function TextField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  description,
  type = 'text',
  disabled,
  autoComplete,
  className,
}: TextFieldProps) {
  const inputId = id || name;
  const descId = description ? `${inputId}-desc` : undefined;
  const errId = error ? `${inputId}-error` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);
  return (
    <div className={`mb-4 ${className || ''}`}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required ? <span className="text-red-600 dark:text-red-400">*</span> : null}
        </label>
      ) : null}
      {description ? (
        <p id={descId} className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      ) : null}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-errormessage={errId}
        className={`ui-input mt-1`}
      />
      {error ? (
        <p id={errId} className="mt-2 text-sm text-red-600 dark:text-red-400" aria-live="polite">{error}</p>
      ) : null}
    </div>
  );
}
