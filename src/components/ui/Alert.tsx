import React from 'react';
import { InfoIcon, AlertCircleIcon, CheckCircleIcon, AlertTriangleIcon } from 'lucide-react';
export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}
export function Alert({
  variant = 'info',
  title,
  children,
  className = ''
}: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-[#f0f4f8]',
      border: 'border-[#2c5f8d]',
      text: 'text-[#1e4976]',
      icon: InfoIcon
    },
    success: {
      bg: 'bg-[#f0fdf4]',
      border: 'border-[#16a34a]',
      text: 'text-[#15803d]',
      icon: CheckCircleIcon
    },
    warning: {
      bg: 'bg-[#fffbeb]',
      border: 'border-[#f59e0b]',
      text: 'text-[#d97706]',
      icon: AlertTriangleIcon
    },
    error: {
      bg: 'bg-[#fef2f2]',
      border: 'border-[#dc2626]',
      text: 'text-[#dc2626]',
      icon: AlertCircleIcon
    }
  };
  const config = variants[variant];
  const Icon = config.icon;
  return <div className={`${config.bg} border-l-4 ${config.border} rounded-xl p-6 ${className}`}>
      <div className="flex gap-4">
        <Icon className={`${config.text} flex-shrink-0`} size={24} />
        <div className="flex-1">
          {title && <h4 className={`font-semibold ${config.text} mb-2`}>{title}</h4>}
          <div className={`${config.text} text-sm leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
    </div>;
}