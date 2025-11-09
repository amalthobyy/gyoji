import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'hero' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      default: 'bg-gradient-to-r from-orange-500 to-teal-500 text-white hover:from-orange-600 hover:to-teal-600 focus:ring-orange-500 shadow-lg hover:shadow-xl',
      outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      hero: 'bg-gradient-to-r from-orange-500 to-teal-500 text-white hover:from-orange-600 hover:to-teal-600 focus:ring-orange-500 shadow-lg hover:shadow-xl',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      gradient: 'bg-gradient-to-r from-orange-500 to-teal-500 text-white hover:from-orange-600 hover:to-teal-600 focus:ring-orange-500 shadow-lg hover:shadow-xl transform hover:scale-105',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-5 text-base',
      lg: 'h-12 px-6 text-lg',
      xl: 'h-14 px-8 text-lg',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

