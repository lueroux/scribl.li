import * as React from 'react';

import { cn } from '../lib/utils';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  spotlight?: boolean;
  gradient?: boolean;
  degrees?: number;

  /**
   * Not sure if this is needed, but added a toggle so it defaults to true since that was how it was before.
   *
   * This is required to be set false if you want drag drop to work within this element.
   */
  backdropBlur?: boolean;
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      children,
      gradient = false,
      degrees = 120,
      backdropBlur = true,
      spotlight = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'transition-functional border-2 border-border bg-card text-card-foreground',
          {
            'rounded-geometric': !gradient,
            'rounded-sharp': gradient,
            'shadow-flat': !spotlight,
            'shadow-minimal': spotlight,
            'hover:border-primary': true,
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
