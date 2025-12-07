import React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  return <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-[#404040] mb-2">
          {label}
        </label>}
      <input id={inputId} className={`
          w-full px-4 py-3 
          bg-white border-2 rounded-xl
          text-[#262626] text-base
          transition-colors
          focus:outline-none focus:border-[#2c5f8d] focus:ring-2 focus:ring-[#2c5f8d] focus:ring-opacity-20
          disabled:bg-[#f5f5f5] disabled:cursor-not-allowed
          ${error ? 'border-[#dc2626]' : 'border-[#d4d4d4]'}
          ${className}
        `} {...props} />
      {error && <p className="mt-2 text-sm text-[#dc2626]">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-[#737373]">{helperText}</p>}
    </div>;
}