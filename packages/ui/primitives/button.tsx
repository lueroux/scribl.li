import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { Loader } from 'lucide-react';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg-plus text-sm font-semibold transition-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-primary text-white hover:shadow-primary hover-lift glow-primary border-0 font-semibold',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-medium hover-lift focus-visible:ring-red-500',
        outline:
          'border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/50 hover:shadow-soft hover-lift backdrop-blur-sm',
        secondary: 'bg-gradient-secondary text-white hover:shadow-medium hover-lift',
        ghost: 'hover:bg-primary/10 hover:text-primary transition-spring hover:shadow-soft',
        link: 'underline-offset-4 hover:underline text-primary transition-fast hover:text-primary/80',
        glass:
          'glass text-primary hover:bg-primary/10 hover:backdrop-blur-md hover:border-primary/20 hover-lift',
        gradient: 'bg-gradient-accent text-white hover:shadow-strong hover-lift glow-primary',
        none: '',
      },
      size: {
        default: 'h-11 py-3 px-6 text-sm',
        sm: 'h-9 px-4 text-xs rounded-md-plus',
        lg: 'h-12 px-8 text-base rounded-xl-plus',
        xl: 'h-14 px-10 text-lg rounded-xl-plus font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const loaderVariants = cva('mr-2 animate-spin', {
  variants: {
    size: {
      default: 'h-5 w-5',
      sm: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;

  /**
   * Will display the loading spinner and disable the button.
   */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
      );
    }

    const isLoading = loading === true;
    const isDisabled = props.disabled || isLoading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={isDisabled}
      >
        {isLoading && <Loader className={cn('mr-2 animate-spin', loaderVariants({ size }))} />}
        {props.children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
