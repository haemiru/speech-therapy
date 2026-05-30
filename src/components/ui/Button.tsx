'use client';

import { cn } from '@/utils/cn';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-xl font-bold transition-all active:scale-95 touch-target',
        'disabled:opacity-50 disabled:active:scale-100',
        {
          'bg-success text-white shadow-lg shadow-green-200 hover:bg-green-600':
            variant === 'primary',
          'bg-white text-gray-700 shadow-md border border-gray-200 hover:bg-gray-50':
            variant === 'secondary',
          'bg-transparent text-gray-600 hover:bg-gray-100':
            variant === 'ghost',
        },
        {
          'h-10 px-4 text-sm': size === 'sm',
          'h-12 px-6 text-base': size === 'md',
          'h-14 px-8 text-lg': size === 'lg',
        },
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
