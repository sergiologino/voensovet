import React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#2c5f8d] text-white hover:bg-[#1e4976] focus:ring-[#2c5f8d]',
    secondary: 'bg-[#e5e5e5] text-[#404040] hover:bg-[#d4d4d4] focus:ring-[#a3a3a3]',
    ghost: 'bg-transparent text-[#2c5f8d] hover:bg-[#f0f4f8] focus:ring-[#2c5f8d]',
    urgent: 'bg-[#5a7f5a] text-white hover:bg-[#456645] focus:ring-[#5a7f5a]'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>;
}