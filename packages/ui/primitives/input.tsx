import * as React from 'react';

import { cn } from '../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Bauhaus functional design
          'border-border bg-background placeholder:text-muted-foreground/70',
          'rounded-geometric flex h-11 w-full border-2 px-4 py-3 text-sm font-medium',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          // Functional focus states
          'transition-functional focus-visible:border-primary focus-visible:outline-none',
          // Hover states
          'hover:border-primary/50',
          // Disabled states
          'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
          // Error states
          {
            '!border-red-600 !bg-red-50 focus-visible:!border-red-600 dark:!bg-red-950/20':
              props['aria-invalid'],
          },
          // Success states
          {
            '!border-green-600 focus-visible:!border-green-600':
              props.value && !props['aria-invalid'] && props.required,
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
