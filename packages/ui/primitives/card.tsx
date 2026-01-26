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
        style={
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {
            '--card-gradient-degrees': `${degrees}deg`,
          } as React.CSSProperties
        }
        className={cn(
          'rounded-xl-plus transition-spring hover-lift group relative border border-border/50 bg-card text-card-foreground',
          {
            'backdrop-blur-[8px]': backdropBlur,
            glass: spotlight,
            'shadow-soft hover:shadow-medium': !gradient && !spotlight,
            'gradient-border-mask before:rounded-xl-plus before:pointer-events-none before:absolute before:-inset-[1px] before:p-[1px] before:[background:linear-gradient(var(--card-gradient-degrees),hsl(var(--primary))_0%,hsl(var(--primary)/0.3)_50%,transparent_100%)]':
              gradient,
            'dark:gradient-border-mask before:rounded-xl-plus before:pointer-events-none before:absolute before:-inset-[1px] before:p-[1px] before:[background:linear-gradient(var(--card-gradient-degrees),hsl(var(--primary)/0.8)_0%,hsl(var(--primary)/0.2)_50%,transparent_100%)]':
              gradient,
            'hover:shadow-strong hover:glow-primary shadow-primary': gradient,
            'hover:border-primary/30 hover:bg-primary/5': spotlight,
            'after:rounded-xl-plus after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/5 after:to-transparent': true,
          },
          className,
        )}
        {...props}
      >
        {children}
        {/* Subtle inner glow effect */}
        <div className="rounded-xl-plus transition-spring pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100" />
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
