import * as React from 'react';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-semibold w-fit transition-functional border-2',
  {
    variants: {
      variant: {
        neutral:
          'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
        destructive:
          'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-600',
        warning:
          'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-600',
        default: 'bg-primary/10 text-primary border-primary hover:bg-primary/20',
        secondary:
          'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-600',
        success:
          'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-600',
        outline: 'bg-transparent border-primary text-primary hover:bg-primary hover:text-white',
        bauhaus: 'bg-bauhaus-yellow text-black border-black font-bold',
      },
      size: {
        xs: 'px-2 py-0.5 text-xs rounded-minimal',
        small: 'px-2.5 py-1 text-xs rounded-geometric',
        default: 'px-3 py-1.5 text-xs rounded-geometric',
        large: 'px-4 py-2 text-sm rounded-geometric',
        xl: 'px-5 py-2.5 text-base rounded-geometric font-bold',
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
