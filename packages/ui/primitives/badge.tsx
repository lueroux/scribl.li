import * as React from 'react';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg-plus font-semibold ring-1 ring-inset w-fit transition-spring backdrop-blur-sm shadow-soft',
  {
    variants: {
      variant: {
        neutral:
          'bg-gray-50/80 text-gray-700 ring-gray-300/30 hover:bg-gray-100/80 hover:ring-gray-400/40 dark:bg-gray-800/60 dark:text-gray-300 dark:ring-gray-600/40 hover:dark:bg-gray-700/80',
        destructive:
          'bg-red-50/80 text-red-700 ring-red-300/40 hover:bg-red-100/80 hover:ring-red-400/50 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-600/40 hover:dark:bg-red-900/80',
        warning:
          'bg-yellow-50/80 text-yellow-800 ring-yellow-300/40 hover:bg-yellow-100/80 hover:ring-yellow-400/50 dark:bg-yellow-950/60 dark:text-yellow-300 dark:ring-yellow-600/40 hover:dark:bg-yellow-900/80',
        default:
          'bg-gradient-to-r from-primary/10 to-primary/5 text-primary ring-primary/20 hover:from-primary/20 hover:to-primary/10 hover:ring-primary/30 shadow-primary/10',
        secondary:
          'bg-blue-50/80 text-blue-700 ring-blue-300/40 hover:bg-blue-100/80 hover:ring-blue-400/50 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-600/40 hover:dark:bg-blue-900/80',
        success:
          'bg-green-50/80 text-green-700 ring-green-300/40 hover:bg-green-100/80 hover:ring-green-400/50 dark:bg-green-950/60 dark:text-green-300 dark:ring-green-600/40 hover:dark:bg-green-900/80',
        outline:
          'bg-transparent border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 backdrop-blur-md',
        glass: 'glass text-primary hover:bg-primary/10 hover:border-primary/20',
      },
      size: {
        xs: 'px-2 py-0.5 text-xs rounded-md-plus',
        small: 'px-2.5 py-1 text-xs',
        default: 'px-3 py-1.5 text-xs',
        large: 'px-4 py-2 text-sm rounded-xl-plus',
        xl: 'px-5 py-2.5 text-base rounded-xl-plus font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div role="status" className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
