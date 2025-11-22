import React from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  className,
  children,
  ariaLabel,
  ...rest
}) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-2 text-lg' : 'px-4 py-2';
  const color = variant === 'primary' ? 'bg-primary text-white hover:bg-blue-700' : variant === 'secondary' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : variant === 'ghost' ? 'bg-transparent text-primary border border-primary hover:bg-primary/10' : 'bg-red-600 text-white hover:bg-red-700';
  const final = cn(base, sizeClass, color, disabled || loading ? 'opacity-50 cursor-not-allowed' : '', className);

  return (
    <button
      type="button"
      className={final}
      aria-label={ariaLabel ?? (typeof children === 'string' ? String(children) : undefined)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
