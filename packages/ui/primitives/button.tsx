import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { Loader } from 'lucide-react';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-primary/90 border-0 font-semibold focus-visible:bg-primary/80',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 focus-visible:bg-red-500',
        outline:
          'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:bg-secondary/70',
        ghost: 'hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/20',
        link: 'underline-offset-4 hover:underline text-primary hover:text-primary/80 focus-visible:text-primary/70',
        glass:
          'bg-background/10 backdrop-blur-sm border border-border text-primary hover:bg-primary/10 hover:border-primary/30',
        gradient: 'bg-gradient-accent text-white hover:opacity-90 focus-visible:opacity-80',
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
      xl: 'h-6 w-6',
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
