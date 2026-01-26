import * as React from 'react';

import { cn } from '../lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Bauhaus functional design
          'border-border bg-background placeholder:text-muted-foreground/70',
          'rounded-geometric flex min-h-[80px] w-full resize-y border-2 px-4 py-3 text-sm font-medium',
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

Textarea.displayName = 'Textarea';

export { Textarea };
