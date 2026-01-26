import * as React from 'react';

import { cn } from '../lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styling with enhanced visual design
          'border-border/60 bg-background/50 ring-offset-background backdrop-blur-sm placeholder:text-muted-foreground/50',
          'rounded-lg-plus flex min-h-[80px] w-full resize-y border-2 px-4 py-3 text-sm font-medium',
          // Enhanced focus and interaction states
          'transition-spring focus-visible:outline-none',
          'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0',
          'focus-visible:shadow-soft focus-visible:bg-background/80',
          // Hover states
          'hover:shadow-soft hover:border-border/80 hover:bg-background/70',
          // Disabled states
          'disabled:cursor-not-allowed disabled:bg-background/30 disabled:opacity-60',
          // Enhanced error states
          {
            'transition-spring !border-red-500/60 !bg-red-50/50 !ring-red-500/20 focus-visible:!border-red-500 focus-visible:!ring-red-500/30 dark:!bg-red-950/20':
              props['aria-invalid'],
          },
          // Success states (when valid and not empty)
          {
            '!border-green-500/40 !ring-green-500/10 focus-visible:!border-green-500/60':
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
