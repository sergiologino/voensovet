import React from 'react';
export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all';
  const variants = {
    default: 'bg-white border border-[#e5e5e5]',
    outlined: 'bg-transparent border-2 border-[#d4d4d4]',
    elevated: 'bg-white shadow-md'
  };
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  const interactiveStyles = onClick || hoverable ? 'cursor-pointer hover:shadow-lg hover:border-[#2c5f8d]' : '';
  return <div className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${interactiveStyles} ${className}`} onClick={onClick}>
      {children}
    </div>;
}